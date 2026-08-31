import * as migration_20260831_124901 from './20260831_124901';

export const migrations = [
  {
    up: migration_20260831_124901.up,
    down: migration_20260831_124901.down,
    name: '20260831_124901'
  },
];
