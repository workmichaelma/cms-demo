// import ContractPage from 'pages/contract'
// import CompanyPage from 'pages/company'
import VehiclePage from 'pages/vehicle'
// import UserPage from 'pages/user'
// import RegMarkPage from 'pages/reg_mark'
// import DriverPage from 'pages/driver'
// import ContractDeductPage from 'pages/contract_deduct'
// import PermitAreaPage from 'pages/permit_area'
// import LicensePage from 'pages/license'
// import InsurancePage from 'pages/insurance'
// import GpsPage from 'pages/gps'
// import AutotollPage from 'pages/autotoll'
// import FuelPage from 'pages/fuel'
// import DriverPermitPage from 'pages/driver_permit'

export const routes = [
  // {
  //   prefix: 'company',
  //   Element: CompanyPage,
  //   title: '公司',
  //   sidebarItem: ['DATABASE', 'company'],
  //   newEntry: true,
  // },
  // {
  //   prefix: 'contract',
  //   Element: ContractPage,
  //   title: '合約',
  //   sidebarItem: ['DATABASE', 'contract'],
  //   newEntry: true,
  // },
  {
    prefix: 'vehicle',
    Element: VehiclePage,
    title: '車輛/機械',
    sidebarItem: ['DATABASE', 'vehicle'],
    newEntry: true,
  },
  // {
  //   prefix: 'reg_mark',
  //   Element: RegMarkPage,
  //   title: '車牌',
  //   sidebarItem: ['DATABASE', 'reg_mark'],
  //   newEntry: true,
  // },
  // {
  //   prefix: 'driver',
  //   Element: DriverPage,
  //   title: '司機',
  //   sidebarItem: ['DATABASE', 'driver'],
  //   newEntry: true,
  // },
  // {
  //   prefix: 'contract_deduct',
  //   Element: ContractDeductPage,
  //   title: '扣數合約',
  //   sidebarItem: ['VEHICLE INFO', 'contract_deduct'],
  //   newEntry: false,
  // },
  // {
  //   prefix: 'permit_area',
  //   Element: PermitAreaPage,
  //   title: '許可證',
  //   sidebarItem: ['VEHICLE INFO', 'permit_area'],
  //   newEntry: false,
  // },
  // {
  //   prefix: 'license',
  //   Element: LicensePage,
  //   title: '車輛續牌',
  //   sidebarItem: ['VEHICLE INFO', 'license'],
  //   newEntry: false,
  // },
  // {
  //   prefix: 'insurance',
  //   Element: InsurancePage,
  //   title: '車輛續保',
  //   sidebarItem: ['VEHICLE INFO', 'insurance'],
  //   newEntry: false,
  // },
  // {
  //   prefix: 'gps',
  //   Element: GpsPage,
  //   title: 'GPS',
  //   sidebarItem: ['VEHICLE INFO', 'gps'],
  //   newEntry: false,
  // },
  // {
  //   prefix: 'fuel',
  //   Element: FuelPage,
  //   title: '燃油卡',
  //   sidebarItem: ['VEHICLE INFO', 'fuel'],
  //   newEntry: false,
  // },
  // {
  //   prefix: 'autotoll',
  //   Element: AutotollPage,
  //   sidebarItem: ['VEHICLE INFO', 'autotoll'],
  //   newEntry: false,
  // },
  // {
  //   prefix: 'user',
  //   Element: UserPage,
  //   title: '用戶管理',
  //   sidebarItem: ['SETTING', 'user'],
  //   newEntry: true,
  // },
  // {
  //   prefix: 'driver_permit',
  //   Element: DriverPermitPage,
  //   title: '駕駛許可',
  //   sidebarItem: ['APPLICATION', 'driver_permit'],
  //   newEntry: true,
  // },
]
