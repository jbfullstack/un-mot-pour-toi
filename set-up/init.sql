CREATE TABLE app_user (
  id            BIGSERIAL PRIMARY KEY,
  uuid          UUID NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  audio_url       TEXT NOT NULL,
  image_url       TEXT NULL,
  video_url       TEXT NULL,
  is_random       BOOLEAN NOT NULL DEFAULT FALSE,
  random_used     BOOLEAN NOT NULL DEFAULT FALSE,
  title           TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media_date (
  media_id     BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  play_date    DATE NOT NULL,
  PRIMARY KEY (media_id, play_date)
);

CREATE TABLE daily_pick (
  user_id      BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  play_date    DATE NOT NULL,
  media_id     BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  picked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, play_date)
);

CREATE INDEX idx_media_user_random ON media(user_id, is_random, random_used);
CREATE INDEX idx_media_date_date ON media_date(play_date);

INSERT INTO app_user(uuid, display_name)
VALUES (gen_random_uuid(), 'default');

-- 1) rendre audio optionnel
ALTER TABLE media
ALTER COLUMN audio_url DROP NOT NULL;

-- 2) garantir qu’il y a AU MOINS un média (audio OU image OU video)
ALTER TABLE media
ADD CONSTRAINT media_has_content
CHECK (
  audio_url IS NOT NULL
  OR image_url IS NOT NULL
  OR video_url IS NOT NULL
);


