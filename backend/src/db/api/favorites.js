const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class FavoritesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const favorites = await db.favorites.create(
      {
        id: data.id || undefined,

        favorite_id: data.favorite_id || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await favorites.setUser(data.user || null, {
      transaction,
    });

    await favorites.setTarget_listing(data.target_listing || null, {
      transaction,
    });

    return favorites;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const favoritesData = data.map((item, index) => ({
      id: item.id || undefined,

      favorite_id: item.favorite_id || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const favorites = await db.favorites.bulkCreate(favoritesData, {
      transaction,
    });

    // For each item created, replace relation files

    return favorites;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const favorites = await db.favorites.findByPk(id, {}, { transaction });

    await favorites.update(
      {
        favorite_id: data.favorite_id || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await favorites.setUser(data.user || null, {
      transaction,
    });

    await favorites.setTarget_listing(data.target_listing || null, {
      transaction,
    });

    return favorites;
  }

  static async deleteByIds(ids, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const favorites = await db.favorites.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    });

    await db.sequelize.transaction(async (transaction) => {
      for (const record of favorites) {
        await record.update({ deletedBy: currentUser.id }, { transaction });
      }
      for (const record of favorites) {
        await record.destroy({ transaction });
      }
    });

    return favorites;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const favorites = await db.favorites.findByPk(id, options);

    await favorites.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await favorites.destroy({
      transaction,
    });

    return favorites;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const favorites = await db.favorites.findOne({ where }, { transaction });

    if (!favorites) {
      return favorites;
    }

    const output = favorites.get({ plain: true });

    output.user = await favorites.getUser({
      transaction,
    });

    output.target_listing = await favorites.getTarget_listing({
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

      {
        model: db.item_listings,
        as: 'target_listing',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.favorite_idRange) {
        const [start, end] = filter.favorite_idRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            favorite_id: {
              ...where.favorite_id,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            favorite_id: {
              ...where.favorite_id,
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

      if (filter.target_listing) {
        var listItems = filter.target_listing.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          target_listingId: { [Op.or]: listItems },
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
          count: await db.favorites.count({
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
      : await db.favorites.findAndCountAll({
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
          Utils.ilike('favorites', 'favorite_id', query),
        ],
      };
    }

    const records = await db.favorites.findAll({
      attributes: ['id', 'favorite_id'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['favorite_id', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.favorite_id,
    }));
  }
};
