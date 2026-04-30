INSERT INTO member (member_id, name, nickname, email, password, created_at)
VALUES
(1, '김철수', 'chul', 'chul@test.com', 'pass123', CURRENT_TIMESTAMP),
(2, '이영희', 'young', 'young@test.com', 'pass123', CURRENT_TIMESTAMP);

INSERT INTO box_list (box_list_id, type, list_order, member_id)
VALUES
(1, 'routine', 1, 1),
(2, 'event', 2, 1),
(3, 'routine', 1, 2);

INSERT INTO work_box (work_box_id, box_list_id, status, bookmark, alarm_id, alarm_time, expired_at, created_at)
VALUES
(1, 1, 'ready', true, 1001, '2026-05-02 09:00:00', '2026-05-03 23:59:59', CURRENT_TIMESTAMP),
(2, 1, 'process', false, 1002, '2026-05-02 14:00:00', '2026-05-04 23:59:59', CURRENT_TIMESTAMP),
(3, 2, 'done', true, null, null, '2026-05-01 23:59:59', CURRENT_TIMESTAMP),
(4, 2, 'ready', false, 1003, '2026-05-03 08:30:00', '2026-05-05 23:59:59', CURRENT_TIMESTAMP),
(5, 3, 'process', true, 1004, '2026-05-02 20:00:00', '2026-05-06 23:59:59', CURRENT_TIMESTAMP);

INSERT INTO block (block_id, name, work_box_id)
VALUES
(1, '기획서 작성', 1),
(2, 'API 개발', 2),
(3, '리팩토링', 3),
(4, '테스트 코드 작성', 4),
(5, '배포 준비', 5);