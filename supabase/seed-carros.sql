-- Ouroville Motors — carros de exemplo (8 veículos, sem fotos).
-- Execute no SQL Editor do seu Supabase DEPOIS de rodar o schema.sql.
-- Dica: para adicionar fotos depois, entre em /admin, edite o carro e envie as imagens.

insert into public.carros
  (marca, modelo, versao, ano, ano_modelo, preco, quilometragem, combustivel, cambio, cor, descricao, destaque, status)
values
  ('Toyota', 'Corolla', 'XEi 2.0 Dynamic Force', 2022, 2022, 149900, 38500, 'Flex', 'Automático', 'Prata',
   'Único dono, revisões na concessionária, laudo cautelar aprovado.', 'Oportunidade', 'disponivel'),
  ('Honda', 'Civic', 'Touring 1.5 Turbo', 2021, 2021, 159900, 45200, 'Gasolina', 'Automático', 'Branco',
   'Teto solar, pacote Honda Sensing, pneus novos.', null, 'disponivel'),
  ('BYD', 'Dolphin Mini', 'EV 38 kWh', 2027, 2027, 119900, 0, 'Elétrico', 'Automático', 'Cinza',
   'Zero quilômetro, garantia de fábrica, isenção de IPVA em MG.', '0 km', 'disponivel'),
  ('Volkswagen', 'T-Cross', 'Highline 250 TSI', 2023, 2023, 139900, 21800, 'Flex', 'Automático', 'Preto',
   'Teto panorâmico, central multimídia VW Play, garantia de fábrica.', null, 'disponivel'),
  ('Jeep', 'Compass', 'Longitude T270 Turbo', 2022, 2023, 144900, 29400, 'Flex', 'Automático', 'Vermelho',
   'Rodas 18", multimídia 10", revisões em dia.', null, 'disponivel'),
  ('Hyundai', 'Creta', 'Platinum 1.0 TGDI', 2023, 2023, 132900, 18700, 'Flex', 'Automático', 'Branco',
   'Pacote ADAS completo, bancos em couro.', 'Novo no estoque', 'disponivel'),
  ('Chevrolet', 'Onix Plus', 'Premier 1.0 Turbo', 2022, 2022, 94900, 33100, 'Flex', 'Automático', 'Prata',
   'Sedã econômico, ótimo para app ou família.', null, 'disponivel'),
  ('Fiat', 'Toro', 'Volcano 2.0 Diesel 4x4', 2021, 2021, 169900, 58300, 'Diesel', 'Automático', 'Preto',
   'Tração 4x4, capota marítima, protetor de caçamba.', null, 'disponivel');
