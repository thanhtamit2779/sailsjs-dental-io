/**
 * WidgetController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const fs = require('fs');
// Base path
const appPath = sails.config.appPath;

// Url image
const baseUrl = sails.config.custom.baseUrl;

module.exports = {
  getWidgets: async (req, res) => {
    const request = req.allParams(); 
    const { Widgets = []} = request;
    console.log('Widgets -> ', Widgets);
    const widgets = [];

    if(Widgets.indexOf('Branch') !== -1) {
      widgets.push({
        name: 'ListBranch',
        data: await WidgetModel.getBranchs()
      })
    }

    if(Widgets.indexOf('Doctor') !== -1) {
      const doctors = await WidgetModel.getDoctors();
      doctors.filter(v => v.StaffId && v.StaffId > 0)

      widgets.push({
        name: 'ListDoctor',
        data: doctors
      })
    }

    if(Widgets.indexOf('AppointmentType') !== -1) {
      widgets.push({
        name: 'AppointmentType',
        data: await WidgetModel.getAppointmentTypes()
      })
    }

    if(Widgets.indexOf('AppointmentStatus') !== -1) {
      widgets.push({
        name: 'AppointmentType',
        data: await WidgetModel.getAppointmentStatus()
      })
    }

    if(Widgets.indexOf('AppointmentStatusNote') !== -1) {
      widgets.push({
        name: 'AppointmentType',
        data: await WidgetModel.getAppointmentStatusNotes()
      })
    }

    if(Widgets.indexOf('AppointmentLabel') !== -1) {
      widgets.push({
        name: 'AppointmentLabel',
        data: await WidgetModel.getAppointmentLabel()
      })
    }

    if(Widgets.indexOf('CustomerType') !== -1) {
      widgets.push({
        name: 'CustomerType',
        data: await WidgetModel.getCustomerTypes()
      })
    }

    return res.ok(widgets);
  },

  getProvinces: async (req, res) => {
    const result = await WidgetModel.getProvinces();
    return res.ok(result);
  },

  getDistricts: async (req, res) => {
    const request = req.allParams(); 
    const { 
      ProvinceId = 1
    } = request;
    const result = await WidgetModel.getDistrictsByProvinceId(ProvinceId);
    return res.ok(result);
  },

  getWards: async (req, res) => {
    const request = req.allParams(); 
    const { 
      DistrictId = 1
    } = request;
    const result = await WidgetModel.getWardsByDistrictId(DistrictId);
    return res.ok(result);
  },

  getAppointmentStatusNotes: async (req, res) => {
    const { params } = req;
    const { AppointmentStatusId = null } = params;

    if(AppointmentStatusId) {
      const result = await WidgetModel.getAppointmentStatusNotes(AppointmentStatusId);
      return res.ok(result);
    }

    return res.ok([]);
  },
};

