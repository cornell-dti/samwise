const GK_GROUP_TASK = 'SAMWISE_GK-GROUP_TASK_ENABLED';

export const isGroupTaskEnabled = (): boolean =>
  process.env.broswer ? localStorage.getItem(GK_GROUP_TASK) === 'true' : false;

const enableGroupTask = (): void => {
  localStorage.setItem(GK_GROUP_TASK, 'true');
  window.location.reload();
};
const disableGroupTask = (): void => {
  localStorage.removeItem(GK_GROUP_TASK);
  window.location.reload();
};

const GateKeeper = { enableGroupTask, disableGroupTask };

declare global {
  interface Window {
    GateKeeper: typeof GateKeeper;
  }
}

export const registerGateKeeper = (): void => {
  window.GateKeeper = GateKeeper;
};
