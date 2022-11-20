import {
  COMPLETED,
  IN_PROGRESS,
  NOT_STARTED,
  READY_FOR_TESTING,
} from '../constants';

export const afterSave = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getStatusColor = (status) => {
  switch (status) {
    case NOT_STARTED:
      return 'failure';
    case IN_PROGRESS:
      return 'warning';
    case READY_FOR_TESTING:
      return undefined;
    case COMPLETED:
      return 'success';
    default:
      return '';
  }
};
