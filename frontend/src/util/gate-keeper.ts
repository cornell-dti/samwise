const GK_GROUP_TASK = 'SAMWISE_GK-GROUP_TASK_ENABLED';

export const isGroupTaskEnabled = (): boolean => localStorage.getItem(GK_GROUP_TASK) === 'true';

const enableGroupTask = (): void => localStorage.setItem(GK_GROUP_TASK, 'true');
const disableGroupTask = (): void => localStorage.removeItem(GK_GROUP_TASK);

const GateKeeper = { enableGroupTask, disableGroupTask };

declare global {
  interface Window {
    GateKeeper: typeof GateKeeper;
  }
}

export const registerGateKeeper = (): void => {
  window.GateKeeper = GateKeeper;
};
