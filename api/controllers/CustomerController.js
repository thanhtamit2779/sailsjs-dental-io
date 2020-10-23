/**
 * CustomerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
  getCustomers: async (req, res) => {
    const request = req.allParams();
    const customers = await CustomerModel.getCustomers(request);
    return res.json(customers);
  },

  getCustomer: async (req, res) => { 
    const { params } = req;
    const { CustomerId = null } = params;

    const customer = await CustomerModel.getCustomer(CustomerId);
    return res.json(customer);
  },

  getCustomerProfile: async (req, res) => {
    const { params } = req;
    const { CustomerId = null } = params;

    const profile = await CustomerModel.getCustomerProfile(CustomerId);
    return res.json(profile);
  },

  checkPhone: async (req, res) => {
    const request = req.allParams() || null; 
    const result = await CustomerModel.checkPhone(request);
    return res.json(result);
  },

  checkEmail: async (req, res) => {
    const request = req.allParams() || null; 
    const result = await CustomerModel.checkEmail(request);
    return res.json(result);
  },

  saveCustomer: async (req, res) => {
    let { CustomerId = null } = req.params;
    const Customer = req.allParams();
    if(Object.values(Customer).length === 0) return res.json(response);

    // Cập nhật
    if(CustomerId && CustomerId > 0) {
      const File = req.file('Photo');
      await CustomerModel.updatePhoto({ File, CustomerId }, async uploadFile => {
        const { 
          Code = false, 
          Notify = [] 
        } = uploadFile;
        if(File && Code) delete Customer.Photo;
        const resultUpdate = await CustomerModel.updateCustomer(Customer, CustomerId);
        return res.json({
          ...resultUpdate,
          Notify: Notify.concat(resultUpdate.Notify)
        });
      });
      return;
    } 

    // Thêm mới
    else {
      const resultSave = await CustomerModel.saveCustomer(Customer);
      const { Customer: { CustomerId = null } } =  resultSave;
      if(CustomerId) {
        const File = req.file('Photo');
        await CustomerModel.updatePhoto({ File, CustomerId }, async uploadFile => {
          const { Notify = [] } = uploadFile;
          return res.json({
            ...resultSave,
            Notify: Notify.concat(resultSave.Notify)
          });
        });
        return
      }
      return res.json(resultSave);
    }
  },

  updateState: async (req, res) => {
    const result = await CustomerModel.changeState(req);
    return res.json(result);
  }
};

