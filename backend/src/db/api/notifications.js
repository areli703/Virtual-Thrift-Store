const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class NotificationsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const notifications = await db.notifications.create(
      {
        id: data.id || undefined,

        notification_id: data.notification_id || null,
        message: data.message || null,
        timestamp: data.timestamp || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await notifications.setUser(data.user || null, {
      transaction,
    });

    return notifications;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const notificationsData = data.map((item, index) => ({
      id: item.id || undefined,

      notification_id: item.notification_id || null,
      message: item.message || null,
      timestamp: item.timestamp || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const notifications = await db.notifications.bulkCreate(notificationsData, {
      transaction,
    });

    // For each item created, replace relation files

    return notifications;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const notifications = await db.notifications.findByPk(
      id,
      {},
      { transaction },
    );

    await notifications.update(
      {
        notification_id: data.notification_id || null,
        message: data.message || null,
        timestamp: data.timestamp || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await notifications.setUser(data.user || null, {
      transaction,
    });

    return notifications;
  }

  static async deleteByIds(ids, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const notifications = await db.notifications.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    });

    await db.sequelize.transaction(async (transaction) => {
      for (const record of notifications) {
        await record.update({ deletedBy: currentUser.id }, { transaction });
      }
      for (const record of notifications) {
        await record.destroy({ transaction });
      }
    });

    return notifications;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const notifications = await db.notifications.findByPk(id, options);

    await notifications.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await notifications.destroy({
      transaction,
    });

    return notifications;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const notifications = await db.notifications.findOne(
      { where },
      { transaction },
    );

    if (!notifications) {
      return notifications;
    }

    const output = notifications.get({ plain: true });

    output.user = await notifications.getUser({
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
        as: 'user',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.message) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('notifications', 'message', filter.message),
        };
      }

      if (filter.notification_idRange) {
        const [start, end] = filter.notification_idRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            notification_id: {
              ...where.notification_id,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            notification_id: {
              ...where.notification_id,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.timestampRange) {
        const [start, end] = filter.timestampRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            timestamp: {
              ...where.timestamp,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            timestamp: {
              ...where.timestamp,
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

      if (filter.user) {
        var listItems = filter.user.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          userId: { [Op.or]: listItems },
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
          count: await db.notifications.count({
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
      : await db.notifications.findAndCountAll({
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
          Utils.ilike('notifications', 'notification_id', query),
        ],
      };
    }

    const records = await db.notifications.findAll({
      attributes: ['id', 'notification_id'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['notification_id', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.notification_id,
    }));
  }
};
