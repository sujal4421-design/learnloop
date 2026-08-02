-- ============================================================
-- LearnLoop Database Schema
-- Log it. Revise it. Remember it.
-- ============================================================

CREATE DATABASE IF NOT EXISTS learnloop;
USE learnloop;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table: logs
-- One learning entry per row.
-- ------------------------------------------------------------
CREATE TABLE logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  title         VARCHAR(150)  NOT NULL,
  description   TEXT          NOT NULL,
  category      VARCHAR(50)   NOT NULL,
  ai_summary    TEXT          NULL,
  date_learned  DATE          NOT NULL DEFAULT (CURRENT_DATE),
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_category ON logs(category);
CREATE INDEX idx_logs_date_learned ON logs(date_learned);

-- ------------------------------------------------------------
-- Table: revisions
-- 5 rows inserted upfront per log: Day 1, 3, 7, 14, 30
-- ------------------------------------------------------------
CREATE TABLE revisions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  log_id         INT           NOT NULL,
  scheduled_date DATE          NOT NULL,
  status         ENUM('pending', 'revised') NOT NULL DEFAULT 'pending',
  revised_at     TIMESTAMP     NULL,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_revisions_log
    FOREIGN KEY (log_id) REFERENCES logs(id)
    ON DELETE CASCADE
);

-- Most frequent query: "what's due today" -> filter by date + status together
CREATE INDEX idx_revisions_date_status ON revisions(scheduled_date, status);
CREATE INDEX idx_revisions_log_id ON revisions(log_id);

-- ------------------------------------------------------------
-- Table: streaks
-- One row per user. Updated whenever a log is created.
-- ------------------------------------------------------------
CREATE TABLE streaks (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNIQUE    NOT NULL,
  current_streak    INT           NOT NULL DEFAULT 0,
  longest_streak    INT           NOT NULL DEFAULT 0,
  last_logged_date  DATE          NULL,

  CONSTRAINT fk_streaks_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Table: sessions
-- Auto-managed by express-mysql-session. Created here for
-- reference only — the package will create/manage this table
-- automatically at runtime if it doesn't exist.
-- ------------------------------------------------------------
CREATE TABLE sessions (
  session_id  VARCHAR(128) PRIMARY KEY,
  expires     INT UNSIGNED NOT NULL,
  data        MEDIUMTEXT
);
