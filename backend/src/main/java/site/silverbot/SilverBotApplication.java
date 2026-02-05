package site.silverbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SilverBotApplication {

	public static void main(String[] args) {
		SpringApplication.run(SilverBotApplication.class, args);
	}

}
