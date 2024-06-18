const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const favorites = sequelize.define(
    'favorites',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      favorite_id: {
        type: DataTypes.INTEGER,
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

  favorites.associate = (db) => {
    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    //end loop

    db.favorites.belongsTo(db.users, {
      as: 'user',
      foreignKey: {
        name: 'userId',
      },
      constraints: false,
    });

    db.favorites.belongsTo(db.item_listings, {
      as: 'target_listing',
      foreignKey: {
        name: 'target_listingId',
      },
      constraints: false,
    });

    db.favorites.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.favorites.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return favorites;
};
