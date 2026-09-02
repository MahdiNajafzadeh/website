import * as migration_20260831_124901 from './20260831_124901';
import * as migration_20260901_backfill_username from './20260901_backfill_username';

export const migrations = [
  {
    up: migration_20260831_124901.up,
    down: migration_20260831_124901.down,
    name: '20260831_124901'
  },
  {
    up: migration_20260901_backfill_username.up,
    down: migration_20260901_backfill_username.down,
    name: '20260901_backfill_username'
  },
];
