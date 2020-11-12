/**
 * UserModel.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const md5 = require("md5");
module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

  login: async (param = null) => {
    let { 
      Email = null, 
      Password = null 
    } = param;
    if(Email && Password) {
      Password = md5(Password);
      const sql = `SELECT 
                    "UserId"
                  FROM "public"."User"
                  WHERE "Email" = '${Email}' AND "Password" = '${Password}'
                  LIMIT 1 OFFSET 0`;
      const execute = await sails.sendNativeQuery(sql);
      const result = execute.rows[0] || null;
      return result;
    }
    return null;
  },

  getUserInfo: async (UserId = null) => {
    if(!UserId) return false;
    const sql = `SELECT 
                  "UserId", 
                  "Email", 
                  "Mobile",
                  "Avatar",
                  "Gender",
                  "Name",
                  "LastLogedIn"
                FROM "public"."User"
                WHERE "UserId" = ${UserId}
                LIMIT 1 OFFSET 0`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows[0] || null;
    return result;
  },

  getStaffByUserId: async (UserId = null) => {
    if(!UserId) return false;
    const sql = `SELECT 
                  "StaffId", 
                  "UserId", 
                  "FullName", 
                  "State"
                 FROM "public"."staff"
                 WHERE "UserId" = ${UserId} AND "State" = 1
                 LIMIT 1 OFFSET 0`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows[0] || null;
    return result;
  },

  lastActiveLogin: async (UserId = null) => {
    if(!UserId) return false;
    const currentDateTimestamp = new Date().getTime();
    const LastLogedIn = ~~(currentDateTimestamp/1000);
    const sql = `UPDATE "public"."User" SET "LastLogedIn"=${LastLogedIn} WHERE "UserId"=${UserId}`;
    return await sails.sendNativeQuery(sql);
  }

};

