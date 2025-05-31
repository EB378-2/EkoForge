// Icons
import {
  ListAlt,  
  BroadcastOnHome,  
  CloudQueue,
  Map,
  PriorityHigh,
  LocalGasStation,
  CameraOutdoor,
  Book,
  Article,
  Info,
  Air,
  Lightbulb,
  AccountBox,
  EnhancedEncryption,
  ContactSupport,
  AdminPanelSettings,
  Gavel,
  MenuBook,
  CalendarMonth,
  DynamicFeed as DynamicFeedIcon,
  BroadcastOnHome as BroadcastOnHomeIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Handshake as HandshakeIcon,
  InsertChart as InsertChartIcon,
  CalendarMonth as CalendarMonthIcon,
  LibraryBooks as LibraryBooksIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBox as AccountBoxIcon,
  Chat as ChatIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Folder as FolderIcon,
  ListAlt as ListAltIcon,
  Store as StoreIcon,
  ContactMail as ContactMailIcon,
  Work as WorkIcon,
  Book as BookIcon,
  NoteAlt as NoteAltIcon
  } from "@mui/icons-material";
    
const resources = [
  {
      name: "home",
      list: `/home`,
      meta: {
        icon: <BroadcastOnHome />,
        label: "Home",
        },
  },
  {
    name: "todolist",                          
    list: "/todolist",
    meta: {
        label: "Todo List",
        icon: <ListAltIcon />,
        canDelete: true,
      }
    },
    {
        name: "projects",                          
        list: "/notes",
        meta: {
          label: "Projects",
          icon: <FolderIcon />
        }
    },
    {
      name: "admin",                          
      list: "/admin",
      meta: {
        label: "Admin",
        icon: <AdminPanelSettings />
      }
    },
    {
        name: "profile",                          
        list: "/profile",
        edit: "/profile/edit/:id",
        meta: {
          label: "Profile",
          icon: <AccountBox />
        }
    },
    {
      name: "notes",                          
      list: "/notes",
      edit: "/notes/edit/:id",
      meta: {
        label: "Notes",
        icon: <NoteAltIcon />, 
        canDelete: true,
      }
    },
    {
        name: "blog",                          
        list: "/blog",
        meta: {
          label: "Blog",
          icon: <Book />
        }
    },
    {
      name: "calendar",                          
      list: "/calendar",
      meta: {
        label: "Calendar",
        icon: <CalendarMonth />
      }
  },
  {
    name: "users",                          
    list: "/admin/users",
    edit: "admin/users/edit/:id",
    meta: {
      label: "users",
      icon: <ListAlt />,
      hide: true,
      parent: "admin"
    }
  },
  {
    name: "project",                          
    list: "/admin/projects",
    meta: {
      label: "projects",
      icon: <ListAlt />,
      hide: true,
      parent: "admin"
    }
  },
  {
      name: "crm",
      identifier: "dashboard",
      list: `/crm`,
      meta: {
      canDelete: true,                            
      label: "Dashboard",
      parent: "crm_dropdown",
      icon: <DashboardIcon />,
      },
  },
  {
      name: "clients",
      list: `/crm/clients`,
      create: `/crm/clients/create`,
      edit: `/crm/clients/edit/:id`,
      show: `/crm/clients/show/:id`,
      meta: {
      canDelete: true,
      label: "Clients",
      parent: "crm_dropdown",
      icon: <BusinessIcon />,
      },
  },
  {
      name: "contacts",
      list: `/crm/contacts`,
      create: `/crm/contacts/create`,
      edit: `/crm/contacts/edit/:id`,
      show: `/crm/contacts/show/:id`,
      meta: {
      canDelete: true,
      label: "Contacts",
      parent: "crm_dropdown",
      icon: <PeopleIcon />,
      },
  },
  {
      name: "prospects",
      list: `/crm/prospects`,
      create: `/crm/prospects/create`,
      edit: `/crm/prospects/edit/:id`,
      show: `/crm/prospects/show/:id`,
      meta: {
      canDelete: true,
      parent: "crm_dropdown",
      icon: <GroupIcon />, 
      },
  },
  {
      name: "deals",
      list: `/crm/deals`,
      create: `/crm/deals/create`,
      edit: `/crm/deals/edit/:id`,
      show: `/crm/deals/show/:id`,
      meta: {
      canDelete: true,
      parent: "crm_dropdown",
      label: "Deals",
      icon: <HandshakeIcon />,
      },
  },
];

export default resources;