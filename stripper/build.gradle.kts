plugins {
    application
    id("java")
    id("com.gradleup.shadow") version "9.0.0-beta9"
}

dependencies {
    implementation("org.ow2.asm:asm:9.7.1")
    implementation("log4j:log4j:1.2.17")

    val log4jVersion = "2.23.1"
    implementation("org.apache.logging.log4j:log4j-api:$log4jVersion")
    implementation("org.apache.logging.log4j:log4j-core:$log4jVersion")
}

application {
    mainClass = "Stripper"
}
