# Checking and Fixing Database Lock Issues

If you're experiencing persistent database lock timeouts when creating courses or batches, follow these steps:

## 1. Check for Stuck Database Processes

```bash
# Connect to MariaDB
bench --site [your-site-name] mariadb

# Show all running processes
SHOW PROCESSLIST;

# Look for processes with:
# - State: "Locked" or "Waiting for table metadata lock"
# - Time: High values (minutes or hours)
# - Info: Queries on `tabLMS Course` or related tables
```

## 2. Kill Stuck Processes

If you find stuck processes:

```sql
-- Kill a specific process (replace PROCESS_ID with the actual ID from SHOW PROCESSLIST)
KILL PROCESS_ID;

-- Or kill all processes for a specific user (be careful!)
KILL QUERY PROCESS_ID;
```

## 3. Check for Long-Running Transactions

```sql
-- Show all transactions
SELECT * FROM information_schema.INNODB_TRX;

-- Show locks
SELECT * FROM information_schema.INNODB_LOCKS;

-- Show lock waits
SELECT * FROM information_schema.INNODB_LOCK_WAITS;
```

## 4. Restart Bench

If locks persist:

```bash
# Stop bench
bench restart

# Or if that doesn't work
bench stop
bench start
```

## 5. Check Frappe Logs

```bash
# Check for errors in logs
tail -f logs/web.log
tail -f logs/worker.log
```

## 6. Clear Cache

```bash
bench clear-cache
bench clear-website-cache
```

## Prevention

The API now includes:
- **Automatic retry logic** (3 attempts with exponential backoff)
- **Better error handling** with rollback
- **Optimized database operations** (single transaction instead of multiple)

If you continue to experience issues, there may be:
1. A stuck transaction from a previous operation
2. Another process (scheduler, worker) holding a lock
3. Database configuration issues (lock wait timeout too low)

## Increase Lock Wait Timeout (if needed)

```sql
-- Check current timeout
SHOW VARIABLES LIKE 'innodb_lock_wait_timeout';

-- Increase timeout (default is 50 seconds)
SET GLOBAL innodb_lock_wait_timeout = 120;
```

