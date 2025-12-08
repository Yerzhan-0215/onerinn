-- ========== 预览（不改数据） ==========
WITH base AS (
  SELECT id, trim(username) AS username_trim
  FROM "User"
),
filled AS (
  SELECT
    id,
    CASE
      WHEN username_trim IS NULL OR username_trim = '' THEN 'user_' || replace(substr(id, 1, 8), '-', '')
      ELSE username_trim
    END AS username_norm
  FROM base
),
ranked AS (
  SELECT
    id,
    username_norm,
    ROW_NUMBER() OVER (PARTITION BY username_norm ORDER BY id) AS rn
  FROM filled
)
SELECT
  id,
  username_norm AS before,
  CASE
    WHEN rn = 1 THEN username_norm
    ELSE username_norm || '_' || rn || '_' || replace(substr(id, 1, 4), '-', '')
  END AS after
FROM ranked
WHERE (username_norm IS NULL OR username_norm = '')
   OR rn > 1
ORDER BY before, rn;

-- ========== 执行修复（事务内） ==========
BEGIN;

-- 1) 去除首尾空格
UPDATE "User"
SET username = trim(username)
WHERE username IS NOT NULL AND username <> trim(username);

-- 2) 把空/NULL 的用户名填充为 user_<id前8位>
UPDATE "User"
SET username = 'user_' || replace(substr(id, 1, 8), '-', '')
WHERE username IS NULL OR username = '';

-- 3) 对重复用户名追加后缀：_<序号>_<id前4位>
WITH ranked AS (
  SELECT id, username, ROW_NUMBER() OVER (PARTITION BY username ORDER BY id) AS rn
  FROM "User"
),
to_fix AS (
  SELECT id, username, rn FROM ranked WHERE rn > 1
),
applied AS (
  UPDATE "User" u
  SET username = u.username || '_' || f.rn || '_' || replace(substr(u.id, 1, 4), '-', '')
  FROM to_fix f
  WHERE u.id = f.id
  RETURNING u.id, u.username
)
SELECT * FROM applied;

-- 4) 最终检查是否还存在重复（应当为 0 行）
SELECT username, COUNT(*)
FROM "User"
GROUP BY username
HAVING COUNT(*) > 1;

COMMIT;

-- ========== 迁移前最后自检 ==========
-- 检查是否还有空 username（应为 0）
SELECT COUNT(*) AS empty_usernames FROM "User" WHERE username IS NULL OR username = '';

-- 检查是否有重复 username（应为 0 行）
SELECT username, COUNT(*) AS dup_count
FROM "User"
GROUP BY username
HAVING COUNT(*) > 1;
