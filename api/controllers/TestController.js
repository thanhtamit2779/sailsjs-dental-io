/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {  
  love: async (req, res) => {
    return res.ok({
      Note: 'Tâm yêu Thảo'
    });
  }
};