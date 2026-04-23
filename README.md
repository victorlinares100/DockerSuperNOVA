**docker compose up -d :** para levantar todos los servicios 

**docker compose exec mi_base_de_datos mariadb -u root -proot -e "USE microservicio_productos; SHOW TABLES;" :** Entra al contenedor de la base de datos (que ya está corriendo) y ejecuta una consulta SQL automática para mostrar la lista de tablas que se crearon con el archivo init.sql.
