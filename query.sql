-- drop table accounts;
-- CREATE TABLE IF NOT EXISTS accounts (
--    id INTEGER PRIMARY KEY AUTOINCREMENT,
--    description text,
--    quantity INTEGER,
--    ammount INTEGER,
--    due INTEGER,
--    type text,
--    instid INTEGER,
--    comment text,
--    date timestamp default CURRENT_DATE
-- );

--  CREATE TABLE IF NOT EXISTS institute (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     name text,
--     details text,
--     contacts text
-- );


-- select * from accounts where type = 'credit' and date = '',

-- insert into people(first_name, last_name)
--     values ("fname", "ভিয়েতনামে করোনার ‘হাইব্রিড’ ধরন শনাক্তame");

-- select * from people where last_name like '%ড%';
-- drop table info;
-- insert into accounts (description, quantity, ammount, due, instid, comment)
--      values ("2 roll of toilet papper", 2, 30, 0, null, "good stuff");

-- insert into institute(name, details, contacts) values("ab interpise", "not good", "+880343434");
-- update accounts set 
--         description="${data.editdescription}",
--         quantity="${data.editquantity}",
--         ammount="${data.ammount}",
--         due="${data.due}",
--         type="${data.type}",
--         comment="${data.editcomment}" where id=1;

-- SELECT institute.id FROM institute institute.name like "%${date}%" INNER JOIN accounts ON institute.id=accounts.instid;
-- select institute.name, institute.id, accounts.id from institute inner join accounts on institute.id=accounts.instid where institute.name like "%a%";
-- select institute.name, accounts.id, accounts.description, accounts.quantity, accounts.ammount, accounts.due, accounts.type, accounts.date from institute inner join accounts on institute.id=accounts.instid where institute.name like "%a%";
select institute.name, accounts.id, accounts.description, accounts.quantity, accounts.ammount, accounts.due, accounts.type, accounts.date from institute inner join accounts on institute.id=accounts.instid where type="credit" and institute.name like "%bla%";