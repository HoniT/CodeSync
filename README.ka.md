# CodeSync

CodeSync არის რეალურ დროში კოდისა და დოკუმენტების სინქრონიზაციის კოლაბორაციული პლატფორმა. 
აწყობილია Spring Boot-ზე და იყენებს WebSockets-სა და stateless JWT ავთენტიფიკაციას დოკუმენტების უსაფრთხო და მყისიერი გაზიარებისთვის.

## მახასიათებლები და ძირითადი API ენდფოინთები
ამას შევავსებ როდესაც დავამთავრებ მუშაობას პროექტზე

## გამოყენებული ტექნოლოგიები
* Backend: Java, Spring Boot 4
* უსაფრთხოება: Spring Security, JJWT
* მონაცემთა ბაზა: PostgreSQL, Spring Data JPA, Flyway
* Build Tool: Maven

## პროექტის გაშვება
### წინაპირობები
* Java 21
* დაინსტალირებული და ჩართული PostgreSQL

### ინსტალაცია და კონფიგურაცია
1. დაკლონე რეპოზიტორია:
   `git clone https://github.com/HoniT/CodeSync.git` `cd CodeSync`
2. დააკონფიგურე გარემო:
   დაამატე .env ფაილი და გაწერე ყველა საჭირო მონაცემი რომელიც განსაზღვრულია [.env.example](.env.example)- ში
3. გაუშვი აპლიკაცია:
   Windows:
   `mvnw.cmd spring-boot:run`
   macOS/Linux:
   `./mvnw spring-boot:run`
    ან უბრალოდ IntelliJ- ს დახმარებით 

პროექტი გაიშვება http://localhost:8080.

## ლიცენზია
ეს პროექტი ვრცელდება MIT ლიცენზიით - დეტალებისთვის იხილეთ [LICENSE](LICENSE) ფაილი.