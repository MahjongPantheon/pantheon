CREATE USER hugin WITH PASSWORD 'pgpass';
CREATE DATABASE hugin;
CREATE DATABASE hugin_unit;
ALTER DATABASE hugin OWNER TO hugin;
ALTER DATABASE hugin_unit OWNER TO hugin;
