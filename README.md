Este proyecto es un sistema de gestión de inventario en tiempo real que utiliza una arquitectura de microservicios (actualmente en transición) con Spring Boot para el Backend, React para el Frontend y MariaDB como base de datos, todo orquestado con Docker.

1 . requisitos : Docker y Docker compose instalados 

2 . clonar el repositorio : https://github.com/victorlinares100/DockerSuperNOVA.git y realizar un cd a la carpeta 

3 . **docker compose up -d ** 
para levantar todos los servicios 

4 . **docker compose exec mi_base_de_datos mariadb -u root -proot -e "USE microservicio_productos; SHOW TABLES;" ** 
Entra al contenedor de la base de datos (que ya está corriendo) y ejecuta una consulta SQL automática para mostrar la lista de tablas que se crearon con el archivo init.sql.

5 . direccion de acceso para ver la pagina web : http://localhost:8090/ 
  API de Productos (Backend): http://localhost:8080/api/v1/productos

6 . para visualizar los datos cargados primero se debe ejecutar el BackendSuperNova, Link del github : https://github.com/victorlinares100/BackendSuperNova.git 

7. Tecnologías Utilizadas
Backend: Java 17, Spring Boot, Spring Data JPA.

Frontend: React.js.

Base de Datos: MariaDB.

Infraestructura: Docker & Docker Compose.

<img width="1911" height="647" alt="image" src="https://github.com/user-attachments/assets/7e30e7d2-880d-4314-867e-9157e6876d79" />
