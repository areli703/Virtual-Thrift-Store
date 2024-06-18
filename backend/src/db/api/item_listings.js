const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class Item_listingsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const item_listings = await db.item_listings.create(
      {
        id: data.id || undefined,

        listing_id: data.listing_id || null,
        title: data.title || null,
        description: data.description || null,
        price: data.price || null,
        category: data.category || null,
        expiration_date: data.expiration_date || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await item_listings.setSeller(data.seller || null, {
      transaction,
    });

    await item_listings.setFavorited_by(data.favorited_by || [], {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.item_listings.getTableName(),
        belongsToColumn: 'photos',
        belongsToId: item_listings.id,
      },
      data.photos,
      options,
    );

    return item_listings;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const item_listingsData = data.map((item, index) => ({
      id: item.id || undefined,

      listing_id: item.listing_id || null,
      title: item.title || null,
      description: item.description || null,
      price: item.price || null,
      category: item.category || null,
      expiration_date: item.expiration_date || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const item_listings = await db.item_listings.bulkCreate(item_listingsData, {
      transaction,
    });

    // For each item created, replace relation files

    for (let i = 0; i < item_listings.length; i++) {
      await FileDBApi.replaceRelationFiles(
        {
          belongsTo: db.item_listings.getTableName(),
          belongsToColumn: 'photos',
          belongsToId: item_listings[i].id,
        },
        data[i].photos,
        options,
      );
    }

    return item_listings;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const item_listings = await db.item_listings.findByPk(
      id,
      {},
      { transaction },
    );

    await item_listings.update(
      {
        listing_id: data.listing_id || null,
        title: data.title || null,
        description: data.description || null,
        price: data.price || null,
        category: data.category || null,
        expiration_date: data.expiration_date || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await item_listings.setSeller(data.seller || null, {
      transaction,
    });

    await item_listings.setFavorited_by(data.favorited_by || [], {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.item_listings.getTableName(),
        belongsToColumn: 'photos',
        belongsToId: item_listings.id,
      },
      data.photos,
      options,
    );

    return item_listings;
  }

  static async deleteByIds(ids, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const item_listings = await db.item_listings.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    });

    await db.sequelize.transaction(async (transaction) => {
      for (const record of item_listings) {
        await record.update({ deletedBy: currentUser.id }, { transaction });
      }
      for (const record of item_listings) {
        await record.destroy({ transaction });
      }
    });

    return item_listings;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const item_listings = await db.item_listings.findByPk(id, options);

    await item_listings.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await item_listings.destroy({
      transaction,
    });

    return item_listings;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const item_listings = await db.item_listings.findOne(
      { where },
      { transaction },
    );

    if (!item_listings) {
      return item_listings;
    }

    const output = item_listings.get({ plain: true });

    output.favorites_target_listing =
      await item_listings.getFavorites_target_listing({
        transaction,
      });

    output.reviews_target_listing =
      await item_listings.getReviews_target_listing({
        transaction,
      });

    output.seller = await item_listings.getSeller({
      transaction,
    });

    output.photos = await item_listings.getPhotos({
      transaction,
    });

    output.favorited_by = await item_listings.getFavorited_by({
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
        as: 'seller',
      },

      {
        model: db.users,
        as: 'favorited_by',
        through: filter.favorited_by
          ? {
              where: {
                [Op.or]: filter.favorited_by.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.favorited_by ? true : null,
      },

      {
        model: db.file,
        as: 'photos',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.title) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('item_listings', 'title', filter.title),
        };
      }

      if (filter.description) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'item_listings',
            'description',
            filter.description,
          ),
        };
      }

      if (filter.listing_idRange) {
        const [start, end] = filter.listing_idRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            listing_id: {
              ...where.listing_id,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            listing_id: {
              ...where.listing_id,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.priceRange) {
        const [start, end] = filter.priceRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            price: {
              ...where.price,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            price: {
              ...where.price,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.expiration_dateRange) {
        const [start, end] = filter.expiration_dateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            expiration_date: {
              ...where.expiration_date,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            expiration_date: {
              ...where.expiration_date,
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

      if (filter.category) {
        where = {
          ...where,
          category: filter.category,
        };
      }

      if (filter.seller) {
        var listItems = filter.seller.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          sellerId: { [Op.or]: listItems },
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
          count: await db.item_listings.count({
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
      : await db.item_listings.findAndCountAll({
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
          Utils.ilike('item_listings', 'title', query),
        ],
      };
    }

    const records = await db.item_listings.findAll({
      attributes: ['id', 'title'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['title', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.title,
    }));
  }
};
