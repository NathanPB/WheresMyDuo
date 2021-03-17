plugins {
    kotlin("jvm") version "1.4.10"
    kotlin("plugin.serialization") version "1.4.10"
}

group = "dev.nathanpb"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
    maven(url = "https://jitpack.io")
    jcenter()
}

dependencies {
    implementation(kotlin("stdlib"))
    implementation("io.ktor:ktor-server-netty:1.4.1")
    implementation("io.ktor:ktor-serialization:1.4.1")
    implementation("com.auth0:java-jwt:3.14.0")
    implementation("com.github.NathanPB:BootingBits:1.0-SNAPSHOT")
    implementation("org.litote.kmongo:kmongo-coroutine-serialization:4.1.2")
    implementation("org.slf4j:slf4j-simple:1.7.30")
    implementation("com.github.kittinunf.fuel:fuel:2.3.0")
    implementation("com.github.kittinunf.fuel:fuel-coroutines:2.3.0")
    implementation("com.github.kittinunf.fuel:fuel-kotlinx-serialization:2.3.0")
    implementation("com.github.husnjak:IGDB-API-JVM:1.0.1")
    implementation("com.apurebase:kgraphql:0.16.0")
    implementation("com.apurebase:kgraphql-ktor:0.16.0")
    implementation("org.reflections:reflections:0.9.12")
    implementation("com.google.protobuf:protobuf-java:3.11.0")
    implementation("com.github.ben-manes.caffeine:caffeine:2.9.0")

    implementation("io.projectreactor:reactor-core:3.4.4")
    implementation("commons-codec:commons-codec:1.15")
}

tasks.withType<Jar> {
    manifest {
        attributes["Main-Class"] = "dev.nathanpb.wmd.MainKt"
    }
    configurations["compileClasspath"].forEach { file: File ->
        from(zipTree(file.absoluteFile))
    }
}

tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile::class).all {
    kotlinOptions {
        jvmTarget = "14"
    }
}
