-- Run in an empty PostgreSQL learning database.

CREATE TABLE customers(id integer PRIMARY KEY,name text NOT NULL,city text,email text);
CREATE TABLE products(id integer PRIMARY KEY,name text NOT NULL,category text NOT NULL,price numeric(10,2) NOT NULL CHECK(price>=0),stock integer NOT NULL CHECK(stock>=0),details jsonb NOT NULL DEFAULT '{}',tags text[] NOT NULL DEFAULT '{}');
CREATE TABLE orders(id integer PRIMARY KEY,customer_id integer NOT NULL REFERENCES customers(id),ordered_at date NOT NULL,status text NOT NULL CHECK(status IN ('paid','pending','cancelled')));
CREATE TABLE order_items(order_id integer REFERENCES orders(id),product_id integer REFERENCES products(id),quantity integer NOT NULL CHECK(quantity>0),unit_price numeric(10,2) NOT NULL CHECK(unit_price>=0),PRIMARY KEY(order_id,product_id));
INSERT INTO customers VALUES (1,'Anna','Kyiv','Anna@example.com'),(2,'Bohdan','Lviv','bohdan@example.com'),(3,'Kateryna','Kyiv',NULL),(4,'Maksym','Odesa','maksym@example.com'),(5,'Olena','Lviv',NULL),(6,'Taras','Dnipro','taras@example.com');
INSERT INTO products VALUES (1,'Mechanical Keyboard','Tech',80,12,'{"color":"black"}','{popular}'),(2,'Wireless Mouse','Tech',30,25,'{"color":"black"}','{beginner,gift}'),(3,'SQL Handbook','Books',25,40,'{"level":"beginner"}','{beginner}'),(4,'Desk Lamp','Home',45,18,'{"color":"white"}','{gift}'),(5,'Notebook','Office',8,100,'{"color":"blue"}','{beginner,gift}'),(6,'Studio Headphones','Tech',120,8,'{"color":"black"}','{popular}'),(7,'Database Internals','Books',60,15,'{"level":"advanced"}','{advanced}'),(8,'Coffee Mug','Home',15,30,'{"color":"white"}','{gift}');
INSERT INTO orders VALUES (1,1,'2025-01-05','paid'),(2,2,'2025-01-12','paid'),(3,1,'2025-02-03','paid'),(4,3,'2025-02-10','pending'),(5,4,'2025-02-15','paid'),(6,2,'2025-03-01','cancelled'),(7,4,'2025-03-11','paid');
INSERT INTO order_items VALUES (1,1,1,80),(1,3,2,25),(2,2,1,30),(2,5,3,8),(3,6,1,120),(3,8,2,15),(4,4,1,45),(5,7,1,60),(5,3,1,25),(6,1,1,80),(7,2,2,30),(7,8,1,15);

