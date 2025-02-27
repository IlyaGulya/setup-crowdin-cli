import org.graalvm.nativeimage.hosted.Feature;
import org.graalvm.nativeimage.hosted.RuntimeReflection;

import java.io.File;
import java.io.IOException;
import java.net.JarURLConnection;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Enumeration;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

public class CrowdinReflectionFeature implements Feature {

    @Override
    public void beforeAnalysis(BeforeAnalysisAccess access) {
        // Specify all packages to scan.
        String[] packagesToScan = {
            "com.crowdin.cli",       // your CLI classes
            "com.crowdin.client",     // your client models
            "org.apache.commons.logging.impl"  // explicitly include commons-logging impl
        };
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        for (String pkg : packagesToScan) {
            registerClassesInPackage(pkg, classLoader);
        }
        // Explicitly register the problematic class.
        registerExplicitly("org.apache.commons.logging.impl.LogFactoryImpl", classLoader);
    }

    private void registerExplicitly(String className, ClassLoader classLoader) {
        try {
            Class<?> clazz = Class.forName(className, false, classLoader);
            System.out.println("Explicitly registering class: " + className);
            RuntimeReflection.register(clazz);
            RuntimeReflection.register(clazz.getDeclaredConstructors());
            RuntimeReflection.register(clazz.getDeclaredMethods());
            RuntimeReflection.register(clazz.getDeclaredFields());
        } catch (Throwable t) {
            System.err.println("Failed to explicitly register class: " + className);
            t.printStackTrace();
        }
    }

    private void registerClassesInPackage(String packageName, ClassLoader classLoader) {
        String path = packageName.replace('.', '/');
        try {
            Enumeration<URL> resources = classLoader.getResources(path);
            while (resources.hasMoreElements()) {
                URL resource = resources.nextElement();
                if ("file".equals(resource.getProtocol())) {
                    File directory = new File(resource.toURI());
                    registerClassesInDirectory(packageName, directory, classLoader);
                } else if ("jar".equals(resource.getProtocol())) {
                    JarURLConnection jarConn = (JarURLConnection) resource.openConnection();
                    try (JarFile jarFile = jarConn.getJarFile()) {
                        Enumeration<JarEntry> entries = jarFile.entries();
                        while (entries.hasMoreElements()) {
                            JarEntry entry = entries.nextElement();
                            String entryName = entry.getName();
                            if (entryName.startsWith(path) && entryName.endsWith(".class") && !entry.isDirectory()) {
                                String className = entryName
                                        .replace('/', '.')
                                        .substring(0, entryName.length() - 6);
                                registerClass(className, classLoader);
                            }
                        }
                    }
                }
            }
        } catch (IOException | URISyntaxException e) {
            System.err.println("Error scanning package: " + packageName);
            e.printStackTrace();
        }
    }

    private void registerClassesInDirectory(String packageName, File directory, ClassLoader classLoader) {
        if (!directory.exists()) return;
        File[] files = directory.listFiles();
        if (files == null) return;
        for (File file : files) {
            if (file.isDirectory()) {
                registerClassesInDirectory(packageName + "." + file.getName(), file, classLoader);
            } else if (file.getName().endsWith(".class")) {
                String className = packageName + "." + file.getName().substring(0, file.getName().length() - 6);
                registerClass(className, classLoader);
            }
        }
    }

    private void registerClass(String className, ClassLoader classLoader) {
        try {
            Class<?> clazz = Class.forName(className, false, classLoader);
            System.out.println("Registering class: " + className);
            RuntimeReflection.register(clazz);
            RuntimeReflection.register(clazz.getDeclaredConstructors());
            RuntimeReflection.register(clazz.getDeclaredMethods());
            RuntimeReflection.register(clazz.getDeclaredFields());
        } catch (Throwable t) {
            System.err.println("Failed to register class: " + className);
        }
    }
}

