INSERT IGNORE INTO task (task_id, name, category, info, member_id)
VALUES (1, '마약, 향정약 확인', '인수인계_상세', NULL, NULL),
       (2, '의료 비품 확인', '인수인계_상세', NULL, NULL),
       (3, '비치 약물 확인', '인수인계_상세', NULL, NULL),
       (4, '약품, 비품 인수인계', '인수인계', NULL, NULL),

       (5, 'V/S Form 출력', 'Form 출력_상세', NULL, NULL),
       (6, 'BST Form 출력', 'Form 출력_상세', NULL, NULL),
       (7, '인계장 출력', 'Form 출력_상세', NULL, NULL),
       (8, '식이표 출력', 'Form 출력_상세', NULL, NULL),
       (9, '익일 사용 Form 출력', 'Form 출력', NULL, NULL),

       (10, 'IV site, drop, 잔여 확인', '정규 라운딩_상세', NULL, NULL),
       (11, 'O2 flow, 호흡 양상, 탱크 잔여량 확인', '정규 라운딩_상세', NULL, NULL),
       (12, 'LOC, NRS, 수면 양상 확인', '정규 라운딩_상세', NULL, NULL),
       (13, '배액관 상태 확인', '정규 라운딩_상세', 'foley, PTBD, T-tube, L-tub, PEG, hemovac..', NULL),
       (14, 'wound 확인', '정규 라운딩_상세', 'Bedsore, suture..', NULL),
       (15, '기타 전신 컨디션 확인', '정규 라운딩_상세', NULL, NULL),
       (16, '라운딩 및 라포, 컨디션 확인', '정규 라운딩', NULL, NULL),

       (17, '변경 식이 전산 입력', '식이정리_상세', NULL, NULL),
       (18, '익일 식이 전산 입력', '식이정리_상세', 'NPO, 경관급식, 외출관련 처리', NULL),
       (19, '식이 입력', '식이정리', NULL, NULL),

       (20, '배액관 관련 오더 확인', '오더 확인_상세', 'T-tub, L-tub, PEG, 흡입배액 처치, suction tip', NULL),
       (21, '당뇨 관련 오더 확인', '오더 확인_상세', '당검사, 인슐린, 팬니들', NULL),
       (22, 'monitoring 관련 오더 확인', '오더 확인_상세', 'EKG, SpO2, infusion pump', NULL),
       (23, '드레싱 관련 오더 확인', '오더 확인_상세', '단순처치, 염증성처치, 소모품', NULL),
       (24, '재활/한방 오더 확인', '오더 확인_상세', NULL, NULL),
       (25, '투석 오더 확인', '오더 확인_상세', NULL, NULL),

       (26, '투약 오더 (만료/변경) 확인', '오더 확인', NULL, NULL),
       (27, '처치 오더 확인', '오더 확인', NULL, NULL),
       (28, '산소 오더 확인', '오더 확인', 'wall, potable..', NULL),
       (29, '소모품 오더 확인', '오더 확인', NULL, NULL),

       (30, '정규 차팅', '전산', NULL, NULL),
       (31, '투약 수행 입력', '전산', NULL, NULL),
       (32, '낙상/욕창/통증 차팅 및 기록지', '전산', NULL, NULL),

       (33, '낙상 등급별 차팅', '전산_상세', NULL, NULL),
       (34, '욕창 등급별 차팅', '전산_상세', NULL, NULL),
       (35, '통증 등급별 차팅', '전산_상세', NULL, NULL),
       (36, '낙상 기록지', '전산_상세', NULL, NULL),
       (37, '욕창 기록지', '전산_상세', NULL, NULL),
       (38, '통증 기록지', '전산_상세', NULL, NULL),

       (39, 'I/O check', '검사', NULL, NULL),
       (40, 'Stool pass', '검사', NULL, NULL),
       (41, 'Blood (일반)', '검사', NULL, NULL),
       (42, 'Blood culture', '검사', NULL, NULL),
       (43, 'Urine (일반)', '검사', NULL, NULL),
       (44, 'Urine culture', '검사', NULL, NULL),
       (45, 'Sputum', '검사', NULL, NULL),
       (46, '복위 측정 (AC)', '검사', NULL, NULL),
       (47, '체중 측정 (BW)', '검사', NULL, NULL),
       (48, 'V/S check', '검사', NULL, NULL),
       (49, 'BST check', '검사', NULL, NULL),

       (50, '정규 inj', '투약', NULL, NULL),
       (51, '정규 PO', '투약', NULL, NULL),
       (52, '식전 인슐린', '투약', NULL, NULL),
       (53, 'Patch', '투약', NULL, NULL),
       (54, '안약 및 연고', '투약', NULL, NULL),

       (55, 'F/U info', '환자 info', NULL, NULL),
       (56, 'NPO notice', '환자 info', NULL, NULL),
       (57, '동의서 작성', '환자 info', NULL, NULL),

       (58, 'Suction', '처치', NULL, NULL),
       (59, 'Foley', '처치', NULL, NULL),
       (60, 'Nelaton', '처치', NULL, NULL),

       (61, '복막 투석 (PD)', '투석', NULL, NULL),
       (62, '혈액 투석 (HD)', '투석', NULL, NULL);

-- 템플릿 보드 (member_id = NULL)
INSERT IGNORE INTO board (board_id, member_id)
VALUES (1, NULL);

-- 박스 (sortIndex는 순서대로)
INSERT IGNORE INTO box (box_id, board_id, box_type, name, sort_index)
VALUES (1, 1, 'ROUTINE', '약품, 비품 인수인계', 0),
       (2, 1, 'ROUTINE', 'Form 출력', 1),
       (3, 1, 'ROUTINE', '식이 입력', 2),
       (4, 1, 'ROUTINE', '오더 확인', 3),
       (5, 1, 'ROUTINE', '정규 차팅', 4),

       (6, 1, 'ROUTINE', '투약 수행 입력', 5),
       (7, 1, 'ROUTINE', '낙상/욕창/통증 차팅', 6),
       (8, 1, 'ROUTINE', 'V/S check', 7),
       (9, 1, 'ROUTINE', 'BST check', 8),
       (10, 1, 'ROUTINE', '인슐린', 9),
       (11, 1, 'ROUTINE', 'I/O, 식사량 체크', 10),
       (12, 1, 'ROUTINE', '검체 내리기', 11);

-- BoxTask
INSERT IGNORE INTO box_task (box_task_id, box_id, task_id, sort_index, is_done)
VALUES (1, 1, 4, 0, false),
       (2, 2, 5, 0, false),
       (3, 2, 6, 1, false),
       (4, 2, 7, 2, false),
       (5, 2, 8, 3, false),
       (6, 3, 17, 0, false),
       (6, 3, 18, 1, false),
       (7, 4, 20, 0, false),
       (8, 4, 26, 1, false),
       (9, 4, 22, 2, false),
       (10, 4, 23, 3, false),
       (11, 5, 30, 0, false),
       (12, 6, 31, 0, false),
       (13, 7, 33, 0, false),
       (14, 7, 34, 1, false),
       (15, 8, 48, 0, false),
       (16, 9, 49, 0, false),
       (17, 10, 52, 0, false),
       (18, 11, 39, 0, false),
       (19, 12, 41, 0, false),
       (20, 12, 43, 1, false);