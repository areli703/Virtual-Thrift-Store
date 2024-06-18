const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class EventsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.create(
      {
        id: data.id || undefined,

        event_id: data.event_id || null,
        event_name: data.event_name || null,
        date_and_time: data.date_and_time || null,
        location: data.location || null,
        description: data.description || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await events.setParticipants(data.participants || [], {
      transaction,
    });

    return events;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const eventsData = data.map((item, index) => ({
      id: item.id || undefined,

      event_id: item.event_id || null,
      event_name: item.event_name || null,
      date_and_time: item.date_and_time || null,
      location: item.location || null,
      description: item.description || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const events = await db.events.bulkCreate(eventsData, { transaction });

    // For each item created, replace relation files

    return events;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.findByPk(id, {}, { transaction });

    await events.update(
      {
        event_id: data.event_id || null,
        event_name: data.event_name || null,
        date_and_time: data.date_and_time || null,
        location: data.location || null,
        description: data.description || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await events.setParticipants(data.participants || [], {
      transaction,
    });

    return events;
  }

  static async deleteByIds(ids, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    });

    await db.sequelize.transaction(async (transaction) => {
      for (const record of events) {
        await record.update({ deletedBy: currentUser.id }, { transaction });
      }
      for (const record of events) {
        await record.destroy({ transaction });
      }
    });

    return events;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.findByPk(id, options);

    await events.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await events.destroy({
      transaction,
    });

    return events;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.findOne({ where }, { transaction });

    if (!events) {
      return events;
    }

    const output = events.get({ plain: true });

    output.participants = await events.getParticipants({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.users,
        as: 'participants',
        through: filter.participants
          ? {
              where: {
                [Op.or]: filter.participants.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.participants ? true : null,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.event_name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('events', 'event_name', filter.event_name),
        };
      }

      if (filter.location) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('events', 'location', filter.location),
        };
      }

      if (filter.description) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('events', 'description', filter.description),
        };
      }

      if (filter.calendarStart && filter.calendarEnd) {
        where = {
          ...where,
          [Op.or]: [
            {
              date_and_time: {
                [Op.between]: [filter.calendarStart, filter.calendarEnd],
              },
            },
            {
              date_and_time: {
                [Op.between]: [filter.calendarStart, filter.calendarEnd],
              },
            },
          ],
        };
      }

      if (filter.event_idRange) {
        const [start, end] = filter.event_idRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            event_id: {
              ...where.event_id,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            event_id: {
              ...where.event_id,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.date_and_timeRange) {
        const [start, end] = filter.date_and_timeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            date_and_time: {
              ...where.date_and_time,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            date_and_time: {
              ...where.date_and_time,
              [Op.lte]: end,
            },
          };
        }
      }

      if (
        filter.active === true ||
        filter.active === 'true' ||
        filter.active === false ||
        filter.active === 'false'
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }
    }

    let { rows, count } = options?.countOnly
      ? {
          rows: [],
          count: await db.events.count({
            where,
            include,
            distinct: true,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            order:
              filter.field && filter.sort
                ? [[filter.field, filter.sort]]
                : [['createdAt', 'desc']],
            transaction,
          }),
        }
      : await db.events.findAndCountAll({
          where,
          include,
          distinct: true,
          limit: limit ? Number(limit) : undefined,
          offset: offset ? Number(offset) : undefined,
          order:
            filter.field && filter.sort
              ? [[filter.field, filter.sort]]
              : [['createdAt', 'desc']],
          transaction,
        });

    //    rows = await this._fillWithRelationsAndFilesForRows(
    //      rows,
    //      options,
    //    );

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('events', 'event_name', query),
        ],
      };
    }

    const records = await db.events.findAll({
      attributes: ['id', 'event_name'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['event_name', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.event_name,
    }));
  }
};
