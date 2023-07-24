import {
  KeyboardArrowDown,
  OtherHouses,
  Storage,
  Topic,
  Settings,
  AttachMoney,
  DriveFileMove,
  Assignment,
} from '@mui/icons-material'

export const items = [
  {
    name: '系統概覽',
    url: '/',
    icon: <OtherHouses sx={{ color: 'white', fontSize: 20 }} />,
    disabled: true,
    key: '',
    isRoot: true,
  },
  {
    name: '資料庫',
    icon: <Storage sx={{ color: 'white' }} />,
    key: 'DATABASE',
    children: [
      {
        name: '合約',
        url: '/contract',
        key: 'contract',
      },
      {
        name: '公司',
        url: '/company',
        key: 'company',
      },
      {
        name: '車輛/機械',
        url: '/vehicle',
        key: 'vehicle',
      },
      {
        name: '司機',
        url: '/driver',
        key: 'driver',
      },
      {
        name: '車牌',
        url: '/reg_mark',
        key: 'reg_mark',
      },
      {
        name: '未套車牌',
        url: '/empty_reg_mark',
        key: 'empty_reg_mark',
      },
    ],
  },
  {
    name: '車輛/機械資料',
    icon: <Topic sx={{ color: 'white' }} />,
    key: 'VEHICLE INFO',
    children: [
      {
        name: '扣數合約',
        url: '/contract_deduct',
        key: 'contract_deduct',
      },
      {
        name: '許可證',
        url: '/permit_area',
        key: 'permit_area',
      },
      {
        name: '車輛續牌',
        url: '/valid_license',
        key: 'valid_license',
      },
      {
        name: '車輛續牌(全部)',
        url: '/license',
        key: 'license',
      },
      {
        name: '車輛續保',
        url: '/valid_insurance',
        key: 'valid_insurance',
      },
      {
        name: '車輛續保(全部)',
        url: '/insurance',
        key: 'insurance',
      },
      {
        name: 'GPS',
        url: '/gps',
        key: 'gps',
      },
      {
        name: 'Autotoll',
        url: '/autotoll',
        key: 'autotoll',
      },
      {
        name: '燃油卡',
        url: '/fuel',
        key: 'fuel',
      },
    ],
  },
  {
    name: '提交申請',
    icon: <DriveFileMove sx={{ color: 'white' }} />,
    key: 'APPLICATION',
    children: [
      {
        name: '駕駛許可',
        url: '/driver_permit',
        key: 'driver_permit',
      },
      {
        name: '維修',
        url: '/repair_record',
        key: 'repair_record',
      },
    ],
  },
  {
    name: '支出',
    icon: <AttachMoney sx={{ color: 'white' }} />,
    children: [
      {
        name: '過路費',
        url: '/expenses_autotoll',
        key: 'expenses_autotoll',
      },
      {
        name: '燃油費',
        url: '/expenses_fuel',
        key: 'expenses_fuel',
      },
    ],
  },
  {
    key: 'REPORT',
    name: '報表',
    icon: <Assignment sx={{ color: 'white' }} />,
    children: [
      {
        name: '合約車輛總結',
        url: '/vehicle_summary',
        key: 'vehicle_summary',
      },
      {
        name: '每月車輛開支',
        url: '/monthly_expenses',
        key: 'monthly_expenses',
      },
      {
        name: '每月車輛轉移',
        url: '/monthly_vehicle',
        key: 'monthly_vehicle',
      },
    ],
  },
  {
    name: '系統設置',
    key: 'SETTING',
    icon: <Settings sx={{ color: 'white' }} />,
    isAdminOnly: true,
    children: [
      // {
      // 	name: 'Log',
      // 	url: '/log',
      // key: 'log'
      // },
      {
        name: '用戶管理',
        url: '/user',
        key: 'user',
      },
    ],
  },
]
