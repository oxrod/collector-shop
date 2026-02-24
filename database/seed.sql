-- ============================================
-- Collector.shop - Seed Data
-- ============================================

-- Categories (needed for articles)
INSERT INTO categories (id, name, description) VALUES
  ('c0000000-0001-4000-a000-000000000001', 'Baskets édition limitée', 'Sneakers et baskets de collection en édition limitée'),
  ('c0000000-0002-4000-a000-000000000002', 'Figurines vintage', 'Figurines de collection anciennes et rétro'),
  ('c0000000-0003-4000-a000-000000000003', 'Consoles rétro', 'Consoles de jeux vidéo rétro et accessoires'),
  ('c0000000-0004-4000-a000-000000000004', 'Cartes à collectionner', 'Cartes Pokémon, Magic, Yu-Gi-Oh et autres'),
  ('c0000000-0005-4000-a000-000000000005', 'Goodies années 80/90', 'Objets promotionnels et dérivés des années 80 et 90');

-- Admin
INSERT INTO users (id, keycloak_id, email, username, first_name, last_name, role) VALUES
  ('a1b2c3d4-0001-4000-a000-000000000001', 'kc-admin-001', 'admin@collector.shop', 'admin', 'Admin', 'Collector', 'admin');

-- 3 Sellers
INSERT INTO users (id, keycloak_id, email, username, first_name, last_name, role) VALUES
  ('a1b2c3d4-0010-4000-a000-000000000010', 'kc-seller-001', 'lucas.martin@email.fr', 'lucas_retro', 'Lucas', 'Martin', 'seller'),
  ('a1b2c3d4-0011-4000-a000-000000000011', 'kc-seller-002', 'sophie.durand@email.fr', 'sophie_vintage', 'Sophie', 'Durand', 'seller'),
  ('a1b2c3d4-0012-4000-a000-000000000012', 'kc-seller-003', 'thomas.bernard@email.fr', 'thomas_collec', 'Thomas', 'Bernard', 'seller');

-- 2 Buyers
INSERT INTO users (id, keycloak_id, email, username, first_name, last_name, role) VALUES
  ('a1b2c3d4-0020-4000-a000-000000000020', 'kc-buyer-001', 'marie.leroy@email.fr', 'marie_fan', 'Marie', 'Leroy', 'buyer'),
  ('a1b2c3d4-0021-4000-a000-000000000021', 'kc-buyer-002', 'julien.moreau@email.fr', 'julien_gamer', 'Julien', 'Moreau', 'buyer');

-- Shops
INSERT INTO shops (id, name, description, owner_id) VALUES
  ('b0000000-0001-4000-a000-000000000001', 'Retro Paradise', 'Boutique spécialisée en consoles et jeux rétro des années 90', 'a1b2c3d4-0010-4000-a000-000000000010'),
  ('b0000000-0002-4000-a000-000000000002', 'Vintage Corner', 'Objets vintage et goodies de collection soigneusement sélectionnés', 'a1b2c3d4-0011-4000-a000-000000000011'),
  ('b0000000-0003-4000-a000-000000000003', 'Collec''Store', 'Cartes et figurines de collection pour passionnés', 'a1b2c3d4-0012-4000-a000-000000000012');

-- 5 Articles
INSERT INTO articles (id, title, description, price, shipping_cost, photo_urls, condition, status, fraud_score, seller_id, shop_id, category_id, created_at) VALUES
  ('d0000000-0001-4000-a000-000000000001',
   'Nintendo Game Boy Color - Édition Pikachu',
   'Superbe Game Boy Color édition spéciale Pikachu en très bon état de fonctionnement. La console a été testée et fonctionne parfaitement avec tous les jeux compatibles. Écran sans rayures majeures, coque jaune Pikachu en excellent état cosmétique. Livrée avec le cache pile d''origine et deux piles AA neuves pour jouer immédiatement.',
   89.99, 6.50,
   '["https://img.collector.shop/articles/gameboy-pikachu-1.jpg", "https://img.collector.shop/articles/gameboy-pikachu-2.jpg", "https://img.collector.shop/articles/gameboy-pikachu-3.jpg"]',
   'Très bon état', 'validated', 0.05,
   'a1b2c3d4-0010-4000-a000-000000000010', 'b0000000-0001-4000-a000-000000000001', 'c0000000-0003-4000-a000-000000000003',
   '2025-11-15 10:30:00+01'),

  ('d0000000-0002-4000-a000-000000000002',
   'Lot de 12 cartes Pokémon 1ère génération FR',
   'Lot exceptionnel de douze cartes Pokémon première génération en version française. Le lot comprend un Dracaufeu holographique édition de base, un Tortank, un Florizarre, ainsi que neuf cartes communes et peu communes en très bon état. Les cartes ont été conservées sous pochettes individuelles depuis leur ouverture. Idéal pour compléter une collection ou débuter un investissement.',
   320.00, 8.00,
   '["https://img.collector.shop/articles/pokemon-lot-1.jpg", "https://img.collector.shop/articles/pokemon-lot-2.jpg"]',
   'Bon état', 'validated', 0.10,
   'a1b2c3d4-0012-4000-a000-000000000012', 'b0000000-0003-4000-a000-000000000003', 'c0000000-0004-4000-a000-000000000004',
   '2025-12-03 14:20:00+01'),

  ('d0000000-0003-4000-a000-000000000003',
   'Nike Air Max 1 OG "Anniversary" Red - Taille 42',
   'Paire de Nike Air Max 1 OG Anniversary coloris University Red en taille 42 européen. Portées seulement trois fois, la semelle est quasi neuve et le mesh blanc est impeccable. Aucune trace de jaunissement sur la bulle d''air. Fournies avec la boîte d''origine, le papier de soie et les lacets supplémentaires blancs. Un classique intemporel pour tout collectionneur de sneakers.',
   185.00, 9.50,
   '["https://img.collector.shop/articles/airmax1-red-1.jpg", "https://img.collector.shop/articles/airmax1-red-2.jpg", "https://img.collector.shop/articles/airmax1-red-3.jpg", "https://img.collector.shop/articles/airmax1-red-4.jpg"]',
   'Très bon état', 'validated', 0.03,
   'a1b2c3d4-0011-4000-a000-000000000011', 'b0000000-0002-4000-a000-000000000002', 'c0000000-0001-4000-a000-000000000001',
   '2026-01-08 09:15:00+01'),

  ('d0000000-0004-4000-a000-000000000004',
   'Figurine Star Wars Boba Fett - Kenner 1979',
   'Figurine originale Boba Fett fabriquée par Kenner en 1979. Cette pièce de collection emblématique de la saga Star Wars est dans un état correct compte tenu de son ancienneté. La peinture présente quelques usures sur le casque et le jetpack, typiques d''une figurine jouée. Toutes les articulations fonctionnent encore correctement. Sans emballage d''origine mais livrée dans un boîtier de protection UV.',
   145.00, 7.00,
   '["https://img.collector.shop/articles/bobafett-kenner-1.jpg", "https://img.collector.shop/articles/bobafett-kenner-2.jpg"]',
   'Correct', 'validated', 0.08,
   'a1b2c3d4-0010-4000-a000-000000000010', 'b0000000-0001-4000-a000-000000000001', 'c0000000-0002-4000-a000-000000000002',
   '2026-01-22 16:45:00+01'),

  ('d0000000-0005-4000-a000-000000000005',
   'Poster dédicacé Retour vers le Futur - Michael J. Fox',
   'Magnifique poster original du film Retour vers le Futur au format 60x90 cm, dédicacé à la main par Michael J. Fox lors d''une convention à Paris en 2018. Le poster est accompagné d''un certificat d''authenticité délivré par l''organisateur de l''événement. Encadré sous verre anti-reflet avec passe-partout ivoire. Aucune décoloration, conservé à l''abri de la lumière directe du soleil depuis sa dédicace.',
   450.00, 15.00,
   '["https://img.collector.shop/articles/poster-bttf-1.jpg", "https://img.collector.shop/articles/poster-bttf-2.jpg", "https://img.collector.shop/articles/poster-bttf-3.jpg"]',
   'Très bon état', 'validated', 0.12,
   'a1b2c3d4-0011-4000-a000-000000000011', 'b0000000-0002-4000-a000-000000000002', 'c0000000-0005-4000-a000-000000000005',
   '2026-02-10 11:00:00+01');
