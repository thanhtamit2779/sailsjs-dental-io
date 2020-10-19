/**
 * CustomerNoteModel.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {
  tableName: 'customernote',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      columnName: 'CustomerNoteId'
    },
    CustomerId: {
      type: 'number',
      allowNull: false    
    },
    CustomerNoteCategoryId: {
      type: 'number',
      allowNull: false    
    },
    Note: {
      type: 'string',
      allowNull: true    
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

