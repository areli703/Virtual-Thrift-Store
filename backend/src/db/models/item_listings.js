const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const item_listings = sequelize.define(
    'item_listings',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      listing_id: {
        type: DataTypes.INTEGER,
      },

      title: {
        type: DataTypes.TEXT,
      },

      description: {
        type: DataTypes.TEXT,
      },

      price: {
        type: DataTypes.DECIMAL,
      },

      category: {
        type: DataTypes.ENUM,

        values: ['Clothing', 'Electronics', 'HomeDecor'],
      },

      expiration_date: {
        type: DataTypes.DATE,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  item_listings.associate = (db) => {
    db.item_listings.belongsToMany(db.users, {
      as: 'favorited_by',
      foreignKey: {
        name: 'item_listings_favorited_byId',
      },
      constraints: false,
      through: 'item_listingsFavorited_byUsers',
    });

    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    db.item_listings.hasMany(db.favorites, {
      as: 'favorites_target_listing',
      foreignKey: {
        name: 'target_listingId',
      },
      constraints: false,
    });

    db.item_listings.hasMany(db.reviews, {
      as: 'reviews_target_listing',
      foreignKey: {
        name: 'target_listingId',
      },
      constraints: false,
    });

    //end loop

    db.item_listings.belongsTo(db.users, {
      as: 'seller',
      foreignKey: {
        name: 'sellerId',
      },
      constraints: false,
    });

    db.item_listings.hasMany(db.file, {
      as: 'photos',
      foreignKey: 'belongsToId',
      constraints: false,
      scope: {
        belongsTo: db.item_listings.getTableName(),
        belongsToColumn: 'photos',
      },
    });

    db.item_listings.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.item_listings.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return item_listings;
};
