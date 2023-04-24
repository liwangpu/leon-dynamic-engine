import { ComponentTypes } from '../enums';

export const ComponentSlotInfo = {
  [ComponentTypes.detailPage]: {
    children: {
    },
    operators: {
    }
  },
  [ComponentTypes.listPage]: {
    children: {
    },
    operators: {
    }
  },
  [ComponentTypes.block]: {
    children: {
    }
  },
  [ComponentTypes.buttonGroup]: {
    children: {
    }
  },
  [ComponentTypes.tabs]: {
    children: {
    }
  },
  [ComponentTypes.tab]: {
    children: {
    }
  },
  [ComponentTypes.table]: {
    operators: {
    },
    columns: {
    },
    operatorColumn: {
      singleton: true
    },
    pagination: {
      singleton: true
    },
    serialNumberColumn: {
      singleton: true
    },
    selectionColumn: {
      singleton: true
    }
  },
  [ComponentTypes.tableOperatorColumn]: {
    children: {
    }
  }
};