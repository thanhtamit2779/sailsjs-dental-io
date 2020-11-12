/**
 * CustomerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {

  getPatients: async (req, res) => {
    const request = req.allParams();
    const customers = await PatientModel.getPatients(request);
    return res.json(customers);
  },

  getPatient: async (req, res) => { 
    const { params } = req;
    const { PatientId = null } = params;

    const customer = await PatientModel.getPatient(PatientId);
    return res.json(customer);
  },

  getPatientProfile: async (req, res) => {
    const { params } = req;
    const { PatientId = null } = params;

    const profile = await PatientModel.getPatientProfile(PatientId);
    return res.json(profile);
  },

  checkPhone: async (req, res) => {
    const request = req.allParams() || null; 
    const result = await PatientModel.checkPhone(request);
    return res.json(result);
  },

  checkEmail: async (req, res) => {
    const request = req.allParams() || null; 
    const result = await PatientModel.checkEmail(request);
    return res.json(result);
  },

  saveCustomer: async (req, res) => {
    let { PatientId = null } = req.params;
    const Customer = req.allParams();
    if(Object.values(Customer).length === 0) return res.json(response);

    // Cập nhật
    if(PatientId && PatientId > 0) {
      const File = req.file('Photo');
      await PatientModel.updatePhoto({ File, PatientId }, async uploadFile => {
        const { 
          Code = false, 
          Notify = [] 
        } = uploadFile;
        if(File && Code) delete Customer.Photo;
        const resultUpdate = await PatientModel.updateCustomer(Customer, PatientId);
        return res.json({
          ...resultUpdate,
          Notify: Notify.concat(resultUpdate.Notify)
        });
      });
      return;
    } 

    // Thêm mới
    else {
      const resultSave = await PatientModel.saveCustomer(Customer);
      const { Customer: { PatientId = null } } =  resultSave;
      if(PatientId) {
        const File = req.file('Photo');
        await PatientModel.updatePhoto({ File, PatientId }, async uploadFile => {
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
    const result = await PatientModel.changeState(req);
    return res.json(result);
  }
};
