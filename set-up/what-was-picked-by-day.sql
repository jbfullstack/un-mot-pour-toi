SELECT u.display_name, dp.play_date, m.title, m.audio_url
FROM daily_pick dp
JOIN app_user u ON u.id = dp.user_id
JOIN media m ON m.id = dp.media_id
ORDER BY dp.play_date DESC;

-- for unknown user
INSERT INTO app_user(uuid, display_name)
VALUES (gen_random_uuid(), 'default');