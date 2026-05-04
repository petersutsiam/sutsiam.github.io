import { useEffect, useMemo, useReducer, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Building,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  DoorOpen,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Shield,
  Sun,
  Unlock,
  User,
  Zap,
  FileText,
  Settings,
  Search,
  Plus,
  X,
  ChevronLeft,
  Download,
  Trash2,
  Edit3,
} from 'lucide-react';

const buildInitialState = () => {
  const now = Date.now();
  const makeDoor = (id, name, buildingId, location, locked, alert, minutesAgo = 2) => ({
    id,
    name,
    buildingId,
    location,
    locked,
    alert,
    updatedAt: now - minutesAgo * 60_000,
    lastAction: locked ? 'locked' : 'unlocked',
    alertReason: alert ? 'Should be locked during active schedule' : '',
  });

  const buildings = [
    { id: 'main-library', name: 'Main Library', doorIds: ['lib-main', 'lib-east', 'lib-exit'] },
    { id: 'science-building', name: 'Science Building', doorIds: ['sci-main', 'sci-lab-a', 'sci-lab-b', 'sci-dock'] },
    { id: 'administration', name: 'Administration', doorIds: ['admin-main', 'admin-side'] },
    { id: 'athletic-center', name: 'Athletic Center', doorIds: ['ath-main', 'ath-lockers', 'ath-pool', 'ath-field'] },
    { id: 'residence-hall', name: 'Student Residence Hall', doorIds: ['res-main', 'res-north', 'res-south'] },
  ];

  const doors = [
    makeDoor('lib-main', 'Main Entrance', 'main-library', 'left', true, false, 15),
    makeDoor('lib-east', 'East Wing', 'main-library', 'top', true, false, 11),
    makeDoor('lib-exit', 'Emergency Exit', 'main-library', 'right', false, true, 4),
    makeDoor('sci-main', 'Main Entrance', 'science-building', 'left', true, false, 20),
    makeDoor('sci-lab-a', 'Lab Wing A', 'science-building', 'top', true, false, 25),
    makeDoor('sci-lab-b', 'Lab Wing B', 'science-building', 'right', true, false, 18),
    makeDoor('sci-dock', 'Loading Dock', 'science-building', 'bottom', true, false, 12),
    makeDoor('admin-main', 'Main Entrance', 'administration', 'left', true, false, 30),
    makeDoor('admin-side', 'Side Door', 'administration', 'right', true, false, 28),
    makeDoor('ath-main', 'Main Entrance', 'athletic-center', 'left', true, false, 22),
    makeDoor('ath-lockers', 'Locker Rooms', 'athletic-center', 'top', true, false, 26),
    makeDoor('ath-pool', 'Pool Entrance', 'athletic-center', 'bottom', true, false, 17),
    makeDoor('ath-field', 'Field Access', 'athletic-center', 'right', true, false, 14),
    makeDoor('res-main', 'Main Entrance', 'residence-hall', 'left', false, false, 7),
    makeDoor('res-north', 'North Wing', 'residence-hall', 'top', false, false, 9),
    makeDoor('res-south', 'South Wing', 'residence-hall', 'bottom', false, false, 10),
  ];

  const schedules = [
    {
      id: 'schedule-regular',
      name: 'Regular School Hours',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      start: '07:00',
      end: '18:00',
      action: 'lock',
      affectedBuildingIds: buildings.map((b) => b.id),
      active: true,
    },
    {
      id: 'schedule-evening',
      name: 'Evening Activities',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      start: '18:00',
      end: '22:00',
      action: 'unlock',
      affectedBuildingIds: ['science-building', 'athletic-center', 'residence-hall'],
      active: false,
    },
    {
      id: 'schedule-weekend',
      name: 'Weekend Hours',
      days: ['Sat', 'Sun'],
      start: '08:00',
      end: '17:00',
      action: 'unlock',
      affectedBuildingIds: ['residence-hall'],
      active: false,
    },
    {
      id: 'schedule-holiday',
      name: 'Holiday/Closed',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      start: '00:00',
      end: '23:59',
      action: 'lock',
      affectedBuildingIds: buildings.map((b) => b.id),
      active: false,
    },
  ];

  return {
    auth: {
      loggedIn: false,
      officerId: '',
      officerName: '',
      badgeNumber: 'CP-0421',
      rank: 'Senior Patrol Officer',
      email: '',
      phone: '(555) 014-9312',
    },
    theme: 'dark',
    activeTab: 'buildings',
    userView: 'main',
    showUserMenu: false,
    selectedBuildingId: 'main-library',
    buildings,
    doors,
    schedules,
    activeScheduleId: 'schedule-regular',
    threatLevel: 'Normal',
    threatLogs: [
      { id: 'log-threat-0', timestamp: now - 120_000, officer: 'Auto System', action: 'Threat level set', target: 'Normal', result: 'Base state' },
    ],
    activityLogs: [
      { id: 'act-0', timestamp: now - 180_000, officer: 'System', action: 'Session initialized', target: 'Dashboard', result: 'Ready' },
    ],
    settings: {
      notificationSounds: true,
      alertThresholdMinutes: 1,
      defaultView: 'Buildings & Doors',
      themePreference: 'dark',
    },
  };
};

const ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_USER_VIEW: 'SET_USER_VIEW',
  SET_USER_MENU: 'SET_USER_MENU',
  SELECT_BUILDING: 'SELECT_BUILDING',
  LOCK_DOOR: 'LOCK_DOOR',
  UNLOCK_DOOR: 'UNLOCK_DOOR',
  LOCK_ALL: 'LOCK_ALL',
  UNLOCK_ALL: 'UNLOCK_ALL',
  CREATE_ALERT: 'CREATE_ALERT',
  CLEAR_ALERT: 'CLEAR_ALERT',
  ADD_BUILDING: 'ADD_BUILDING',
  ADD_DOOR: 'ADD_DOOR',
  ADD_SCHEDULE: 'ADD_SCHEDULE',
  UPDATE_SCHEDULE: 'UPDATE_SCHEDULE',
  ACTIVATE_SCHEDULE: 'ACTIVATE_SCHEDULE',
  DELETE_SCHEDULE: 'DELETE_SCHEDULE',
  SET_THREAT_LEVEL: 'SET_THREAT_LEVEL',
  ADD_THREAT_LOG: 'ADD_THREAT_LOG',
  ADD_ACTIVITY_LOG: 'ADD_ACTIVITY_LOG',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return {
        ...state,
        auth: {
          ...state.auth,
          loggedIn: true,
          officerId: action.officerId,
          officerName: `Officer ${action.officerId}`,
          email: `${action.officerId.toLowerCase()}@campuspnp.edu`,
        },
      };
    case ACTIONS.LOGOUT:
      return {
        ...buildInitialState(),
        theme: state.theme,
      };
    case ACTIONS.TOGGLE_THEME:
      return {
        ...state,
        theme: state.theme === 'dark' ? 'light' : 'dark',
      };
    case ACTIONS.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.tab, userView: 'main' };
    case ACTIONS.SET_USER_VIEW:
      return { ...state, userView: action.view, showUserMenu: false };
    case ACTIONS.SET_USER_MENU:
      return { ...state, showUserMenu: action.show };
    case ACTIONS.SELECT_BUILDING:
      return { ...state, selectedBuildingId: action.buildingId, userView: 'main' };
    case ACTIONS.LOCK_DOOR:
      return {
        ...state,
        doors: state.doors.map((door) =>
          door.id === action.doorId
            ? { ...door, locked: true, alert: false, updatedAt: Date.now(), lastAction: 'locked', alertReason: '' }
            : door
        ),
      };
    case ACTIONS.UNLOCK_DOOR:
      return {
        ...state,
        doors: state.doors.map((door) =>
          door.id === action.doorId
            ? { ...door, locked: false, updatedAt: Date.now(), lastAction: 'unlocked' }
            : door
        ),
      };
    case ACTIONS.LOCK_ALL:
      return {
        ...state,
        doors: state.doors.map((door) => ({ ...door, locked: true, alert: false, updatedAt: Date.now(), lastAction: 'locked', alertReason: '' })),
      };
    case ACTIONS.UNLOCK_ALL:
      return {
        ...state,
        doors: state.doors.map((door) => ({ ...door, locked: false, updatedAt: Date.now(), lastAction: 'unlocked' })),
      };
    case ACTIONS.CREATE_ALERT:
      return {
        ...state,
        doors: state.doors.map((door) =>
          door.id === action.doorId
            ? { ...door, alert: true, alertReason: action.reason || 'Security alert', updatedAt: door.updatedAt }
            : door
        ),
      };
    case ACTIONS.CLEAR_ALERT:
      return {
        ...state,
        doors: state.doors.map((door) =>
          door.id === action.doorId ? { ...door, alert: false, alertReason: '' } : door
        ),
      };
    case ACTIONS.ADD_BUILDING:
      return {
        ...state,
        buildings: [...state.buildings, action.building],
        doors: [...state.doors, ...action.doors],
      };
    case ACTIONS.ADD_DOOR:
      return {
        ...state,
        buildings: state.buildings.map((building) =>
          building.id === action.door.buildingId
            ? { ...building, doorIds: [...building.doorIds, action.door.id] }
            : building
        ),
        doors: [...state.doors, action.door],
      };
    case ACTIONS.ADD_SCHEDULE:
      return {
        ...state,
        schedules: [...state.schedules, action.schedule],
      };
    case ACTIONS.UPDATE_SCHEDULE:
      return {
        ...state,
        schedules: state.schedules.map((schedule) =>
          schedule.id === action.schedule.id ? { ...action.schedule } : schedule
        ),
      };
    case ACTIONS.ACTIVATE_SCHEDULE:
      return {
        ...state,
        schedules: state.schedules.map((schedule) => ({ ...schedule, active: schedule.id === action.scheduleId })),
        activeScheduleId: action.scheduleId,
      };
    case ACTIONS.DELETE_SCHEDULE:
      return {
        ...state,
        schedules: state.schedules.filter((schedule) => schedule.id !== action.scheduleId),
        activeScheduleId: state.activeScheduleId === action.scheduleId ? state.schedules[0]?.id : state.activeScheduleId,
      };
    case ACTIONS.SET_THREAT_LEVEL:
      return {
        ...state,
        threatLevel: action.level,
      };
    case ACTIONS.ADD_THREAT_LOG:
      return {
        ...state,
        threatLogs: [action.entry, ...state.threatLogs],
      };
    case ACTIONS.ADD_ACTIVITY_LOG:
      return {
        ...state,
        activityLogs: [action.entry, ...state.activityLogs],
      };
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    default:
      return state;
  }
};

const statusColors = {
  Normal: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  Elevated: 'bg-amber-500/10 text-amber-700 dark:text-amber-200',
  High: 'bg-orange-500/10 text-orange-700 dark:text-orange-200',
  Critical: 'bg-red-500/10 text-red-700 dark:text-red-200',
};

const levelDescriptions = {
  Normal: 'Standard operations',
  Elevated: 'Increased monitoring',
  High: 'Restricted access; key buildings auto-lock',
  Critical: 'All doors locked; lockdown active',
};

const formatScheduleLabel = (schedule) => {
  const dayString = schedule.days.length === 7 ? 'Everyday' : schedule.days.join('–');
  return `${dayString} ${schedule.start} – ${schedule.end}`;
};

const getRelativeTime = (timestamp) => {
  const delta = Math.max(0, Date.now() - timestamp);
  const minutes = Math.round(delta / 60_000);
  if (minutes < 1) return 'Just now';
  return `${minutes} min ago`;
};

const makeActivityEntry = (officer, action, target, result) => ({
  id: `act-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  timestamp: Date.now(),
  officer,
  action,
  target,
  result,
});

export default function App() {
  const [state, dispatch] = useReducer(reducer, null, buildInitialState);
  const [loginForm, setLoginForm] = useState({ officerId: '', password: '' });
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', confirmLabel: 'Confirm', action: null, danger: false });
  const [toasts, setToasts] = useState([]);
  const [tick, setTick] = useState(0);
  const [addBuildingName, setAddBuildingName] = useState('');
  const [newBuildingDoors, setNewBuildingDoors] = useState('');
  const [newDoor, setNewDoor] = useState({ buildingId: state.buildings[0]?.id || '', name: '', location: 'left' });
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [doorModalOpen, setDoorModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ id: '', name: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start: '07:00', end: '18:00', action: 'lock', affectedBuildingIds: state.buildings.map((b) => b.id) });
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [logFilter, setLogFilter] = useState({ type: 'All', search: '', from: '', to: '' });
  const [profileEditing, setProfileEditing] = useState(false);

  const buildingOptions = useMemo(
    () => state.buildings.map((building) => ({ value: building.id, label: building.name })),
    [state.buildings]
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  useEffect(() => {
    const interval = setInterval(() => setTick((prev) => prev + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const activeSchedule = state.schedules.find((schedule) => schedule.id === state.activeScheduleId);
    if (!activeSchedule) return;
    if (['High', 'Critical'].includes(state.threatLevel)) return;

    if (activeSchedule.action === 'lock') {
      state.doors.forEach((door) => {
        if (!door.locked && activeSchedule.affectedBuildingIds.includes(door.buildingId)) {
          const deltaMinutes = (Date.now() - door.updatedAt) / 60_000;
          if (deltaMinutes >= state.settings.alertThresholdMinutes && !door.alert) {
            dispatch({ type: ACTIONS.CREATE_ALERT, doorId: door.id, reason: 'Should be locked during active schedule' });
            addToast(`${door.name} alert triggered`, 'danger');
            dispatch({
              type: ACTIONS.ADD_ACTIVITY_LOG,
              entry: makeActivityEntry(state.auth.officerName || 'Officer', 'Generated alert', door.name, 'Alert created'),
            });
          }
        }
      });
    }
  }, [state.doors, state.activeScheduleId, state.settings.alertThresholdMinutes, tick, state.threatLevel]);

  useEffect(() => {
    if (['High', 'Critical'].includes(state.threatLevel)) {
      dispatch({ type: ACTIONS.LOCK_ALL });
      dispatch({
        type: ACTIONS.ADD_ACTIVITY_LOG,
        entry: makeActivityEntry(state.auth.officerName || 'Officer', 'Auto-lock', 'All doors', `Locked due to ${state.threatLevel}`),
      });
    }
  }, [state.threatLevel]);

  const activeSchedule = useMemo(
    () => state.schedules.find((schedule) => schedule.id === state.activeScheduleId),
    [state.schedules, state.activeScheduleId]
  );

  const alertDoors = useMemo(() => state.doors.filter((door) => door.alert), [state.doors]);
  const lockedCount = useMemo(() => state.doors.filter((door) => door.locked).length, [state.doors]);
  const totalCount = state.doors.length;
  const showLockButtons = !['Critical'].includes(state.threatLevel);
  const currentOfficer = state.auth.officerName || state.auth.officerId || 'Officer';

  const handleToast = (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3200);
  };

  const login = () => {
    if (!loginForm.officerId.trim() || !loginForm.password.trim()) {
      handleToast('Officer ID and password are required.', 'danger');
      return;
    }
    dispatch({ type: ACTIONS.LOGIN, officerId: loginForm.officerId.trim() });
    dispatch({ type: ACTIONS.ADD_ACTIVITY_LOG, entry: makeActivityEntry(`Officer ${loginForm.officerId}`, 'Login', 'Campus Security Control', 'Success') });
    setLoginForm({ officerId: '', password: '' });
    handleToast('Welcome to Campus Security Control');
  };

  const openConfirmation = ({ title, message, confirmLabel, action, danger = false }) => {
    setConfirm({ open: true, title, message, confirmLabel, action, danger });
  };

  const confirmAction = () => {
    if (confirm.action) confirm.action();
    setConfirm((prev) => ({ ...prev, open: false }));
  };

  const handleLogout = () => {
    dispatch({ type: ACTIONS.ADD_ACTIVITY_LOG, entry: makeActivityEntry(currentOfficer, 'Logout', 'Campus Security Control', 'Success') });
    dispatch({ type: ACTIONS.LOGOUT });
    setLoginForm({ officerId: '', password: '' });
    handleToast('Logged out successfully', 'success');
  };

  const handleDoorToggle = (door) => {
    if (!showLockButtons) {
      handleToast('Unlock disabled during lockdown', 'danger');
      return;
    }
    if (door.locked) {
      dispatch({ type: ACTIONS.UNLOCK_DOOR, doorId: door.id });
      dispatch({ type: ACTIONS.ADD_ACTIVITY_LOG, entry: makeActivityEntry(currentOfficer, 'Unlock', door.name, 'Door unlocked') });
      handleToast(`${door.name} unlocked`, 'success');
    } else {
      dispatch({ type: ACTIONS.LOCK_DOOR, doorId: door.id });
      dispatch({ type: ACTIONS.ADD_ACTIVITY_LOG, entry: makeActivityEntry(currentOfficer, 'Lock', door.name, 'Door locked') });
      handleToast(`${door.name} locked`, 'success');
      dispatch({ type: ACTIONS.CLEAR_ALERT, doorId: door.id });
    }
  };

  const handleEmergencyUnlock = () => {
    dispatch({ type: ACTIONS.UNLOCK_ALL });
    dispatch({ type: ACTIONS.ADD_ACTIVITY_LOG, entry: makeActivityEntry(currentOfficer, 'Emergency unlock', 'All doors', 'Unlocked in emergency') });
    handleToast('Emergency unlock triggered', 'danger');
  };

  const handleLockAll = () => {
    dispatch({ type: ACTIONS.LOCK_ALL });
    dispatch({ type: ACTIONS.ADD_ACTIVITY_LOG, entry: makeActivityEntry(currentOfficer, 'Lock all', 'All doors', 'All doors secured') });
    handleToast('All doors secured', 'success');
  };

  const handleThreatChange = (level) => {
    dispatch({ type: ACTIONS.SET_THREAT_LEVEL, level });
    dispatch({ type: ACTIONS.ADD_THREAT_LOG, entry: { id: `threat-${Date.now()}`, timestamp: Date.now(), officer: currentOfficer, action: `Set threat level`, target: level, result: `${level} engaged` } });
    dispatch({ type: ACTIONS.ADD_ACTIVITY_LOG, entry: makeActivityEntry(currentOfficer, 'Threat change', level, 'Level updated') });
    handleToast(`Threat level set to ${level}`, level === 'Critical' ? 'danger' : 'success');
  };

  const handleActivateSchedule = (scheduleId) => {
    dispatch({ type: ACTIONS.ACTIVATE_SCHEDULE, scheduleId });
    const schedule = state.schedules.find((item) => item.id === scheduleId);
    if (schedule?.action === 'lock') {
      dispatch({ type: ACTIONS.LOCK_ALL });
    }
    dispatch({ type: ACTIONS.ADD_ACTIVITY_LOG, entry: makeActivityEntry(currentOfficer, 'Activate schedule', schedule?.name || scheduleId, 'Schedule activated') });
    handleToast(`${schedule?.name || 'Schedule'} is active`, 'success');
  };

  const handleAddBuilding = () => {
    if (!addBuildingName.trim()) {
      handleToast('Building name is required', 'danger');
      return;
    }
    const id = addBuildingName.trim().toLowerCase().replace(/\s+/g, '-');
    if (state.buildings.some((building) => building.id === id)) {
      handleToast('Building already exists', 'danger');
      return;
    }
    const doorNames = newBuildingDoors
      .split(/\r?\n|,/)
      .map((name) => name.trim())
      .filter(Boolean);
    const doorIds = doorNames.map((name, index) => `${id}-door-${index + 1}`);
    const doors = doorNames.map((name, index) => ({
      id: doorIds[index],
      name,
      buildingId: id,
      location: ['left', 'top', 'right', 'bottom'][index % 4],
      locked: true,
      alert: false,
      updatedAt: Date.now(),
      lastAction: 'locked',
      alertReason: '',
    }));
    dispatch({ type: ACTIONS.ADD_BUILDING, building: { id, name: addBuildingName.trim(), doorIds }, doors });
    setAddBuildingName('');
    setNewBuildingDoors('');
    handleToast('Building added', 'success');
  };

  const handleAddDoor = () => {
    if (!newDoor.name.trim() || !newDoor.buildingId) {
      handleToast('Door name and building are required', 'danger');
      return;
    }
    const id = `${newDoor.buildingId}-${newDoor.name.trim().toLowerCase().replace(/\s+/g, '-')}`;
    if (state.doors.some((door) => door.id === id)) {
      handleToast('Door name already exists', 'danger');
      return;
    }
    const door = {
      id,
      name: newDoor.name.trim(),
      buildingId: newDoor.buildingId,
      location: newDoor.location,
      locked: true,
      alert: false,
      updatedAt: Date.now(),
      lastAction: 'locked',
      alertReason: '',
    };
    dispatch({ type: ACTIONS.ADD_DOOR, door });
    setNewDoor({ buildingId: state.buildings[0]?.id || '', name: '', location: 'left' });
    handleToast('Door added', 'success');
  };

  const handleSaveSchedule = () => {
    if (!scheduleForm.name.trim()) {
      handleToast('Schedule name is required', 'danger');
      return;
    }
    if (isEditingSchedule) {
      dispatch({ type: ACTIONS.UPDATE_SCHEDULE, schedule: scheduleForm });
      handleToast('Schedule updated', 'success');
    } else {
      const schedule = { ...scheduleForm, id: `schedule-${Date.now()}`, active: false };
      dispatch({ type: ACTIONS.ADD_SCHEDULE, schedule });
      handleToast('Schedule created', 'success');
    }
    setScheduleModalOpen(false);
    setIsEditingSchedule(false);
    setScheduleForm({ id: '', name: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start: '07:00', end: '18:00', action: 'lock', affectedBuildingIds: state.buildings.map((b) => b.id) });
  };

  const handleEditSchedule = (schedule) => {
    setScheduleModalOpen(true);
    setIsEditingSchedule(true);
    setScheduleForm({ ...schedule });
  };

  const filteredLogs = useMemo(() => {
    return state.activityLogs.filter((entry) => {
      const typeMatch = logFilter.type === 'All' || entry.action.toLowerCase().includes(logFilter.type.toLowerCase());
      const searchMatch = !logFilter.search || [entry.officer, entry.action, entry.target, entry.result].some((value) => value.toLowerCase().includes(logFilter.search.toLowerCase()));
      const fromMatch = !logFilter.from || entry.timestamp >= new Date(`${logFilter.from}T00:00`).getTime();
      const toMatch = !logFilter.to || entry.timestamp <= new Date(`${logFilter.to}T23:59`).getTime();
      return typeMatch && searchMatch && fromMatch && toMatch;
    });
  }, [state.activityLogs, logFilter]);

  const handleExportCsv = () => {
    const csvRows = [['Timestamp', 'Officer', 'Action', 'Target', 'Result']].concat(
      filteredLogs.map((entry) => [new Date(entry.timestamp).toLocaleString(), entry.officer, entry.action, entry.target, entry.result])
    );
    const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'activity-logs.csv';
    link.click();
    URL.revokeObjectURL(url);
    handleToast('CSV export started', 'success');
  };

  const damageDisabled = !showLockButtons;

  if (!state.auth.loggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/95 p-8 shadow-soft shadow-slate-950/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-sky-300 ring-2 ring-sky-500/40">
              <div className="text-sm font-extrabold tracking-[0.3em] uppercase">SAFE</div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Campus Police Portal</h1>
              <p className="mt-2 text-slate-400">Access control and security management system</p>
            </div>
          </div>
          <div className="mt-8 space-y-6">
            <label className="block text-sm font-semibold text-slate-200">Officer ID</label>
            <input
              value={loginForm.officerId}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, officerId: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              placeholder="Enter your officer ID"
            />
            <label className="block text-sm font-semibold text-slate-200">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              placeholder="Enter your password"
            />
            <button
              onClick={login}
              className="mt-4 w-full rounded-2xl bg-sky-700 px-4 py-3 text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderUserView = () => {
    switch (state.userView) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/10 bg-white/80 p-6 shadow-soft shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900/90">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-sky-600">My Profile</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Officer Information</h2>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">Editable profile details for quick reference and contact.</p>
                </div>
                <button
                  onClick={() => setProfileEditing((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Edit3 className="h-4 w-4" />
                  {profileEditing ? 'Cancel Edit' : 'Edit'}
                </button>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/80">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-600 text-white">OP</div>
                    <div>
                      <p className="text-sm text-slate-500">Officer Name</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{state.auth.officerName}</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">Badge</p>
                      <p>{state.auth.badgeNumber}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">Rank</p>
                      <p>{state.auth.rank}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/80">
                  <div className="grid gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Officer ID</p>
                      <p className="text-slate-600 dark:text-slate-300">{state.auth.officerId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Contact</p>
                      <p className="text-slate-600 dark:text-slate-300">{state.auth.phone}</p>
                      <p className="text-slate-600 dark:text-slate-300">{state.auth.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/10 bg-white/90 p-6 shadow-soft shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900/90">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Activity Logs</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Chronological event history</h2>
                </div>
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Download className="h-4 w-4" />
                  Export to CSV
                </button>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px]">
                <input
                  type="text"
                  value={logFilter.search}
                  onChange={(event) => setLogFilter((prev) => ({ ...prev, search: event.target.value }))}
                  placeholder="Search logs"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <select
                  value={logFilter.type}
                  onChange={(event) => setLogFilter((prev) => ({ ...prev, type: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {['All', 'Login', 'Lock', 'Unlock', 'Schedule', 'Threat', 'Alert', 'Logout'].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full border-separate border-spacing-0 text-sm">
                  <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">Timestamp</th>
                      <th className="px-4 py-3 text-left font-semibold">Officer</th>
                      <th className="px-4 py-3 text-left font-semibold">Action</th>
                      <th className="px-4 py-3 text-left font-semibold">Target</th>
                      <th className="px-4 py-3 text-left font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-slate-700 dark:divide-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    {filteredLogs.slice(0, 20).map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-4 align-top">{new Date(entry.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-4 align-top">{entry.officer}</td>
                        <td className="px-4 py-4 align-top">{entry.action}</td>
                        <td className="px-4 py-4 align-top">{entry.target}</td>
                        <td className="px-4 py-4 align-top">{entry.result}</td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-slate-500 dark:text-slate-400" colSpan="5">
                          No logs match the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'shift':
        return (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-slate-200/10 bg-white/90 p-6 shadow-soft shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900/90">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Shift Schedule</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Weekly duty roster</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Your current shift and broader department coverage.</p>
              </div>
              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-7 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 p-4">
                  {['6AM-2PM', '2PM-10PM', 'Off', '6AM-2PM', '2PM-10PM', 'Off', 'Off'].map((shift, index) => (
                    <div key={index} className="rounded-3xl border border-slate-200 bg-sky-50 px-3 py-5 text-center text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      {shift}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200/10 bg-white/90 p-6 shadow-soft shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900/90">
              <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Team roster</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Department coverage</h2>
              <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {[
                  { name: 'Sergeant Riley', shift: '6AM-2PM' },
                  { name: 'Officer Chen', shift: '2PM-10PM' },
                  { name: 'Officer Patel', shift: '6AM-2PM' },
                  { name: 'Dispatch Support', shift: '24/7' },
                ].map((person) => (
                  <div key={person.name} className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{person.name}</p>
                    <p className="text-slate-500 dark:text-slate-400">{person.shift}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="rounded-3xl border border-slate-200/10 bg-white/90 p-6 shadow-soft shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900/90">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Settings</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Preferences</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Customize alerts and dashboard behavior.</p>
            </div>
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/80">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Notification sounds</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Play sound for important alerts.</p>
                  </div>
                  <button
                    onClick={() => {
                      dispatch({ type: ACTIONS.UPDATE_SETTINGS, settings: { notificationSounds: !state.settings.notificationSounds } });
                      handleToast(`Notification sounds ${state.settings.notificationSounds ? 'disabled' : 'enabled'}`, 'success');
                    }}
                    className={`inline-flex h-10 w-20 items-center rounded-full p-1 transition ${state.settings.notificationSounds ? 'bg-sky-700' : 'bg-slate-300 dark:bg-slate-700'}`}
                    aria-pressed={state.settings.notificationSounds}
                  >
                    <span className={`inline-block h-8 w-8 rounded-full bg-white transition ${state.settings.notificationSounds ? 'translate-x-10' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/80">
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Alert threshold</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Trigger alert when a door is unlocked for this many minutes outside schedule.</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={state.settings.alertThresholdMinutes}
                    onChange={(event) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, settings: { alertThresholdMinutes: Number(event.target.value) } })}
                    className="w-28 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/80">
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Theme preference</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Select the dashboard theme.</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {['light', 'dark'].map((option) => (
                      <button
                        key={option}
                        onClick={() => dispatch({ type: ACTIONS.UPDATE_SETTINGS, settings: { themePreference: option } })}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${state.settings.themePreference === option ? 'border-sky-600 bg-sky-50 text-slate-900 dark:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'}`}
                      >
                        <p className="font-semibold capitalize">{option}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{option === 'dark' ? 'Dark mode interface' : 'Light mode interface'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] bg-slate-900/95 px-6 py-5 shadow-soft shadow-slate-950/20 backdrop-blur-xl dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800 text-sky-300 ring-2 ring-sky-500/35">
                <div className="text-sm font-extrabold uppercase tracking-[0.24em]">SAFE</div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-sky-400/90">Campus Security Control</p>
                <h1 className="text-2xl font-bold text-white">Welcome, {currentOfficer}</h1>
                <p className="text-sm text-slate-300">Campus Police Officer dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch({ type: ACTIONS.TOGGLE_THEME })}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-slate-100 transition hover:border-sky-500"
                aria-label="Toggle theme"
              >
                {state.theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => dispatch({ type: ACTIONS.SET_USER_MENU, show: !state.showUserMenu })}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 text-sm font-semibold text-white transition hover:border-sky-500"
                  aria-haspopup="true"
                  aria-expanded={state.showUserMenu}
                >
                  <Menu className="h-5 w-5" />
                  Menu
                </button>
                {state.showUserMenu && (
                  <div className="absolute right-0 z-20 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-xl shadow-slate-950/50">
                    <div className="border-b border-slate-800 p-4">
                      <p className="text-sm text-slate-400">{currentOfficer}</p>
                      <p className="mt-1 text-sm font-semibold">Campus Police Officer</p>
                    </div>
                    <div className="space-y-1 p-3">
                      {[
                        { label: 'My Profile', icon: User, view: 'profile' },
                        { label: 'Activity Logs', icon: FileText, view: 'logs' },
                        { label: 'Shift Schedule', icon: Clock, view: 'shift' },
                        { label: 'Settings', icon: Settings, view: 'settings' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => dispatch({ type: ACTIONS.SET_USER_VIEW, view: item.view })}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition hover:bg-slate-800"
                        >
                          <item.icon className="h-4 w-4 text-sky-400" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-800 p-3">
                      <button
                        onClick={() => openConfirmation({ title: 'Confirm logout', message: 'Sign out and clear the session?', confirmLabel: 'Logout', danger: true, action: handleLogout })}
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mt-6 space-y-6">
          <section className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500">Doors Locked</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">{lockedCount}/{totalCount}</p>
              <p className="mt-2 text-sm text-slate-500">Total secured access points</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500">Security Alerts</p>
              <p className="mt-3 text-3xl font-bold text-red-600">{alertDoors.length}</p>
              <p className="mt-2 text-sm text-slate-500">Active issues requiring attention</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500">Active Schedule</p>
              <p className="mt-3 text-2xl font-bold text-sky-700 dark:text-sky-300">{activeSchedule?.name || 'None'}</p>
              <p className="mt-2 text-sm text-slate-500">{activeSchedule ? formatScheduleLabel(activeSchedule) : 'No schedule selected'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                <p className="text-sm text-slate-500">Threat Level</p>
              </div>
              <div className={`mt-4 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${statusColors[state.threatLevel]}`}>
                {state.threatLevel}
              </div>
              <p className="mt-2 text-sm text-slate-500">{levelDescriptions[state.threatLevel]}</p>
            </div>
          </section>

          <section>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'buildings', label: 'Buildings & Doors', icon: Shield },
                { id: 'schedules', label: 'Schedules', icon: Calendar },
                { id: 'threat', label: 'Threat Management', icon: Bell },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => dispatch({ type: ACTIONS.SET_ACTIVE_TAB, tab: item.id })}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${state.activeTab === item.id ? 'border-sky-300 bg-sky-100 text-slate-900 dark:border-sky-500 dark:bg-slate-800 dark:text-slate-100' : 'border-transparent bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>

          {state.userView !== 'main' ? (
            renderUserView()
          ) : (
            <section className="space-y-6">
              {state.activeTab === 'buildings' && (
                <div className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                    <div className="rounded-3xl border border-sky-100/80 bg-sky-50 p-6 shadow-soft dark:border-slate-700 dark:bg-slate-950/90">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-600 text-white">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Emergency Controls</p>
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Quickly lock or unlock all doors in emergency situations.</p>
                        </div>
                      </div>
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <button
                          onClick={() => openConfirmation({ title: 'Emergency unlock all?', message: 'Unlock every door in the campus now?', confirmLabel: 'Unlock All', danger: true, action: handleEmergencyUnlock })}
                          className="inline-flex items-center justify-center gap-2 rounded-3xl bg-red-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-red-500"
                        >
                          <AlertTriangle className="h-5 w-5" />
                          Emergency Unlock All
                        </button>
                        <button
                          onClick={() => openConfirmation({ title: 'Lock all doors?', message: 'Secure all doors immediately.', confirmLabel: 'Lock All', danger: false, action: handleLockAll })}
                          className="inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          <Lock className="h-5 w-5" />
                          Lock All Doors
                        </button>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Security Alerts</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Active door alerts waiting for action.</p>
                        </div>
                        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                          {alertDoors.length} Critical Alert(s)
                        </span>
                      </div>
                      <div className="mt-6 space-y-4">
                        {alertDoors.length === 0 ? (
                          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-300">
                            No active alerts. All systems secure.
                          </div>
                        ) : (
                          alertDoors.map((door) => (
                            <div key={door.id} className="flex flex-col gap-4 rounded-3xl border border-red-200/80 bg-red-50 p-4 text-slate-900 dark:border-red-500/40 dark:bg-red-950/20 dark:text-slate-100 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-base font-bold text-red-700 dark:text-red-300">{door.name}</p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Door unlocked for {getRelativeTime(door.updatedAt)} - should be locked.</p>
                              </div>
                              <button
                                onClick={() => {
                                  dispatch({ type: ACTIONS.LOCK_DOOR, doorId: door.id });
                                  dispatch({ type: ACTIONS.ADD_ACTIVITY_LOG, entry: makeActivityEntry(currentOfficer, 'Lock', door.name, 'Door locked from alert') });
                                  handleToast(`${door.name} locked`, 'success');
                                }}
                                className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                              >
                                Lock Now
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Campus Map</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Click on a building to view its details, or click on doors to toggle locks.</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => dispatch({ type: ACTIONS.SET_USER_VIEW, view: 'main' })}
                          className="hidden rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 md:inline-flex"
                        >
                          Refresh Map
                        </button>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.5fr]">
                      <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/80">
                        <div className="grid gap-4 sm:grid-cols-2">
                          {state.buildings.map((building) => {
                            const buildingDoors = state.doors.filter((door) => door.buildingId === building.id);
                            const lockedInBuilding = buildingDoors.filter((door) => door.locked).length;
                            const hasAlerts = buildingDoors.some((door) => door.alert);
                            return (
                              <button
                                key={building.id}
                                onClick={() => dispatch({ type: ACTIONS.SELECT_BUILDING, buildingId: building.id })}
                                className={`relative rounded-3xl border p-4 text-left transition ${state.selectedBuildingId === building.id ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-200/40 dark:border-sky-400 dark:bg-slate-800' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}
                              >
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{building.name}</p>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{lockedInBuilding}/{buildingDoors.length} locked</p>
                                {hasAlerts && <span className="mt-3 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">⚠ Alert</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/80">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Legend</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500"></span> Locked
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-3 w-3 rounded-full bg-orange-400"></span> Unlocked
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-3 w-3 rounded-full bg-red-600"></span> Alert
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {state.buildings.map((building) => {
                        const buildingDoors = state.doors.filter((door) => door.buildingId === building.id);
                        const lockedInBuilding = buildingDoors.filter((door) => door.locked).length;
                        const hasAlerts = buildingDoors.some((door) => door.alert);
                        return (
                          <div key={building.id} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                            <div className="relative h-40 rounded-3xl bg-slate-100 p-4 dark:bg-slate-950">
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{building.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{lockedInBuilding}/{buildingDoors.length} locked</p>
                                {hasAlerts && <p className="text-sm font-semibold text-red-600">⚠ {buildingDoors.filter((door) => door.alert).length} alert</p>}
                              </div>
                              <div className="pointer-events-none absolute inset-0" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex flex-wrap gap-3 sm:justify-between sm:items-center">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Buildings & Doors</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage structures and access points.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              setAddBuildingName('');
                              setNewBuildingDoors('');
                              setBuildingModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            <Plus className="h-4 w-4" />
                            Add Building
                          </button>
                          <button
                            onClick={() => {
                              setNewDoor({ buildingId: state.buildings[0]?.id || '', name: '', location: 'left' });
                              setDoorModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-100"
                          >
                            <DoorOpen className="h-4 w-4" />
                            Add Door
                          </button>
                        </div>
                      </div>
                      <div className="mt-6 space-y-5">
                        {state.buildings.map((building) => {
                          const buildingDoors = state.doors.filter((door) => door.buildingId === building.id);
                          const lockedInBuilding = buildingDoors.filter((door) => door.locked).length;
                          return (
                            <div key={building.id} id={`detail-${building.id}`} className={`rounded-3xl border ${state.selectedBuildingId === building.id ? 'border-sky-400 bg-sky-50/60 dark:border-sky-500 dark:bg-slate-800' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                                <div>
                                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{building.name}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{lockedInBuilding}/{buildingDoors.length} Locked</p>
                                </div>
                                <button
                                  onClick={() => {
                                    dispatch({ type: ACTIONS.LOCK_ALL });
                                    dispatch({ type: ACTIONS.ADD_ACTIVITY_LOG, entry: makeActivityEntry(currentOfficer, 'Lock all', `${building.name}`, 'Secured all building doors') });
                                    handleToast(`Locked all doors in ${building.name}`, 'success');
                                  }}
                                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                  Lock All Doors in Building
                                </button>
                              </div>
                              <div className="space-y-3 p-5">
                                {buildingDoors.map((door) => (
                                  <div key={door.id} className={`rounded-3xl border p-4 ${door.alert ? 'border-red-500/40 bg-red-50 dark:border-red-500/30 dark:bg-red-950/20' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'}`}>
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{door.name}</p>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{door.lastAction === 'locked' ? 'Locked' : 'Unlocked'} • {getRelativeTime(door.updatedAt)}</p>
                                        {door.alert && <p className="mt-2 text-sm font-semibold text-red-700 dark:text-red-300">⚠ ALERT: Door should be locked!</p>}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-3">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${door.alert ? 'bg-red-600 text-white' : door.locked ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-200' : 'border border-slate-300 bg-transparent text-slate-700 dark:border-slate-600 dark:text-slate-200'}`}>
                                          {door.locked ? 'Secured' : 'Open'}
                                        </span>
                                        <button
                                          onClick={() => handleDoorToggle(door)}
                                          disabled={!showLockButtons && !door.locked}
                                          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${door.locked ? 'bg-slate-900 text-white hover:bg-slate-800' : 'border border-slate-300 bg-transparent text-slate-900 hover:border-slate-400 dark:border-slate-700 dark:text-slate-100'} ${damageDisabled && !door.locked ? 'cursor-not-allowed opacity-60' : ''}`}
                                        >
                                          {door.locked ? 'Unlock' : 'Lock'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {state.activeTab === 'schedules' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Schedule Manager</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Campus access routines</h2>
                      </div>
                      <button
                        onClick={() => {
                          setIsEditingSchedule(false);
                          setScheduleForm({ id: '', name: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start: '07:00', end: '18:00', action: 'lock', affectedBuildingIds: state.buildings.map((b) => b.id) });
                          setScheduleModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        <Plus className="h-4 w-4" />
                        Create Schedule
                      </button>
                    </div>
                    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                      <table className="min-w-full text-sm text-slate-700 dark:text-slate-200">
                        <thead className="bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-300">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Name</th>
                            <th className="px-4 py-3 text-left font-semibold">Hours</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Days</th>
                            <th className="px-4 py-3 text-left font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                          {state.schedules.map((schedule) => (
                            <tr key={schedule.id}>
                              <td className="px-4 py-4">{schedule.name}</td>
                              <td className="px-4 py-4">{schedule.start} – {schedule.end}</td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${schedule.id === state.activeScheduleId ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                  {schedule.id === state.activeScheduleId ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-4">{schedule.days.join(', ')}</td>
                              <td className="px-4 py-4 space-x-2">
                                <button
                                  onClick={() => handleActivateSchedule(schedule.id)}
                                  className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                >
                                  Activate
                                </button>
                                <button
                                  onClick={() => handleEditSchedule(schedule)}
                                  className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => openConfirmation({ title: 'Delete schedule?', message: `Remove ${schedule.name}?`, confirmLabel: 'Delete', danger: true, action: () => { dispatch({ type: ACTIONS.DELETE_SCHEDULE, scheduleId: schedule.id }); handleToast('Schedule deleted', 'danger'); } })}
                                  className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {state.activeTab === 'threat' && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
                    <div className="grid gap-6 lg:grid-cols-[0.9fr_0.8fr] lg:items-center">
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Threat Management</p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">Current threat posture</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">Use the controls below to adjust alert posture and access restrictions.</p>
                      </div>
                      <div className={`rounded-3xl p-6 text-center ${statusColors[state.threatLevel]} dark:bg-slate-800/80`}> 
                        <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">Status</p>
                        <p className="mt-3 text-4xl font-bold">{state.threatLevel}</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{levelDescriptions[state.threatLevel]}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-3 md:grid-cols-4">
                      {['Normal', 'Elevated', 'High', 'Critical'].map((level) => (
                        <button
                          key={level}
                          onClick={() => openConfirmation({ title: `Set threat level to ${level}?`, message: `This will update controls for ${level}.`, confirmLabel: `Set ${level}`, danger: level === 'Critical', action: () => handleThreatChange(level) })}
                          className={`rounded-3xl px-4 py-4 text-sm font-semibold transition ${state.threatLevel === level ? 'border border-sky-500 bg-sky-100 text-slate-900 dark:bg-slate-800' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-600 dark:text-slate-400">High and Critical levels will force an auto-lock across campus.</p>
                      <button
                        onClick={() => openConfirmation({ title: 'Initiate lockdown?', message: 'Lockdown will secure all doors and broadcast an alert.', confirmLabel: 'Initiate Lockdown', danger: true, action: () => handleThreatChange('Critical') })}
                        className="inline-flex items-center gap-2 rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                      >
                        <Zap className="h-4 w-4" />
                        Initiate Lockdown
                      </button>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Threat Log</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Recent threat actions</h2>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{state.threatLogs.length} entries</span>
                    </div>
                    <div className="mt-6 space-y-4">
                      {state.threatLogs.map((entry) => (
                        <div key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{entry.action}</p>
                            <span className="text-sm text-slate-500 dark:text-slate-400">{getRelativeTime(entry.timestamp)}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{entry.officer} — {entry.target} • {entry.result}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {confirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Confirm action</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{confirm.title}</h2>
              </div>
              <button onClick={() => setConfirm((prev) => ({ ...prev, open: false }))} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{confirm.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirm((prev) => ({ ...prev, open: false }))} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white transition ${confirm.danger ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Schedule</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{isEditingSchedule ? 'Edit Schedule' : 'Create Schedule'}</h2>
              </div>
              <button onClick={() => setScheduleModalOpen(false)} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Name</label>
                <input
                  value={scheduleForm.name}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Schedule name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Action</label>
                <select
                  value={scheduleForm.action}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, action: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="lock">Lock</option>
                  <option value="unlock">Unlock</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Start</label>
                <input
                  type="time"
                  value={scheduleForm.start}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, start: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">End</label>
                <input
                  type="time"
                  value={scheduleForm.end}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, end: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Days</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setScheduleForm((prev) => {
                          const has = prev.days.includes(day);
                          return { ...prev, days: has ? prev.days.filter((item) => item !== day) : [...prev.days, day] };
                        });
                      }}
                      className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${scheduleForm.days.includes(day) ? 'bg-sky-600 text-white' : 'border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Buildings affected</label>
                <div className="mt-3 space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                  {state.buildings.map((building) => (
                    <label key={building.id} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={scheduleForm.affectedBuildingIds.includes(building.id)}
                        onChange={() => {
                          setScheduleForm((prev) => {
                            const has = prev.affectedBuildingIds.includes(building.id);
                            return {
                              ...prev,
                              affectedBuildingIds: has ? prev.affectedBuildingIds.filter((id) => id !== building.id) : [...prev.affectedBuildingIds, building.id],
                            };
                          });
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      {building.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setScheduleModalOpen(false)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleSaveSchedule} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {buildingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Add Building</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">New campus building</h2>
              </div>
              <button onClick={() => setBuildingModalOpen(false)} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Building name</label>
                <input
                  value={addBuildingName}
                  onChange={(event) => setAddBuildingName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Main Gate, West Wing, etc."
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Initial doors</label>
                <textarea
                  value={newBuildingDoors}
                  onChange={(event) => setNewBuildingDoors(event.target.value)}
                  rows="4"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Enter door names separated by commas or new lines"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setBuildingModalOpen(false)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={() => { handleAddBuilding(); setBuildingModalOpen(false); }} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                Save Building
              </button>
            </div>
          </div>
        </div>
      )}

      {doorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Add Door</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">New access point</h2>
              </div>
              <button onClick={() => setDoorModalOpen(false)} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Building</label>
                <select
                  value={newDoor.buildingId}
                  onChange={(event) => setNewDoor((prev) => ({ ...prev, buildingId: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {state.buildings.map((building) => (
                    <option key={building.id} value={building.id}>{building.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Door name</label>
                <input
                  value={newDoor.name}
                  onChange={(event) => setNewDoor((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="North Entrance"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Door location</label>
              <select
                value={newDoor.location}
                onChange={(event) => setNewDoor((prev) => ({ ...prev, location: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {['left', 'right', 'top', 'bottom'].map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDoorModalOpen(false)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={() => { handleAddDoor(); setDoorModalOpen(false); }} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                Save Door
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={`w-full max-w-xs rounded-3xl border px-4 py-3 text-sm font-semibold shadow-soft ${toast.type === 'danger' ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-950/80 dark:text-red-200' : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
