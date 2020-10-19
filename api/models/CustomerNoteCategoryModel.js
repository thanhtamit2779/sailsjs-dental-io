/**
 * CustomerNoteCategoryModel.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const fs = require('fs');
const appPath = sails.config.appPath;

module.exports = {
  tableName: 'customernotecategory',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      columnName: 'CustomerNoteCategoryId'
    },
    // CustomerNoteCategoryId: {
    //   type: 'number',
    //   allowNull: false    
    // },
    Name: {
      type: 'string',
      allowNull: true    
    },
    State: {
      type: 'number',
      allowNull: false,
      defaultsTo: 1       
    },
    Ordering: {
      type: 'number',
      allowNull: false,
      defaultsTo: 1       
    },
    AddedAt: {
      type: 'number',
      allowNull: true    
    },
    AddedBy: {
      type: 'number',
      allowNull: true    
    },
    EditedAt: {
      type: 'number',
      allowNull: true    
    },
    EditedBy: {
      type: 'number',
      allowNull: true    
    }
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  }
};

