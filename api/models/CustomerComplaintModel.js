/**
 * CustomerComplaintModel.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {
  tableName: 'customercomplaint',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      columnName: 'CustomerComplaintId'
    },
    CustomerId: {
      type: 'number',
      allowNull: false    
    },
    CustomerUsingServiceId: {
      type: 'number',
      allowNull: true    
    },
    ComplaintAboutReasonId: {
      type: 'number',
      allowNull: true    
    },
    NetPromoterScore: {
      type: 'number',
      allowNull: true    
    },
    ComplaintedAt: {
      type: 'number',
      allowNull: true    
    },
    CreatedBy: {
      type: 'number',
      allowNull: true    
    },
    Note: {
      type: 'string',
      allowNull: true  
    },
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

