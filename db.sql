CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `username_UNIQUE` (`username`)
)
CREATE TABLE `follow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `followerId` varchar(100) NOT NULL,
  `followingId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `followingId_idx` (`followerId`),
  KEY `followerId_idx` (`followingId`),
  CONSTRAINT `followerId` FOREIGN KEY (`followingId`) REFERENCES `users` (`email`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `followingId` FOREIGN KEY (`followerId`) REFERENCES `users` (`email`) ON DELETE NO ACTION ON UPDATE NO ACTION
)