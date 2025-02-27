import org.objectweb.asm.*;
import java.io.*;
import java.util.Enumeration;
import java.util.jar.*;
import janala.instrument.SafeClassWriter;
import java.net.URL;
import java.net.URLClassLoader;

public class Stripper {
    public static void main(String[] args) throws Exception {
        if (args.length < 2) {
            System.out.println("Usage: java Stripper <inputJar> <outputJar>");
            return;
        }
        File inputJar = new File(args[0]);
        File outputJar = new File(args[1]);

        URLClassLoader source = new URLClassLoader(
                new URL[] {inputJar.toURI().toURL()},
                Stripper.class.getClassLoader()
        );

        try (JarFile jar = new JarFile(inputJar);
             JarOutputStream jos = new JarOutputStream(new FileOutputStream(outputJar))) {
            Enumeration<JarEntry> entries = jar.entries();
            while (entries.hasMoreElements()) {
                JarEntry entry = entries.nextElement();
                byte[] data;
                try (InputStream is = jar.getInputStream(entry)) {
                    data = is.readAllBytes();
                }
                if (entry.getName().endsWith(".class")) {
                    // Transform the class: rewrite AWT references.
                    ClassReader cr = new ClassReader(data);
                    ClassWriter cw = new SafeClassWriter(cr, source, ClassWriter.COMPUTE_MAXS | ClassWriter.COMPUTE_FRAMES);
                    ClassVisitor cv = new AWTReplacementClassVisitor(cw);
                    cr.accept(cv, 0);
                    data = cw.toByteArray();
                }
                JarEntry newEntry = new JarEntry(entry.getName());
                jos.putNextEntry(newEntry);
                jos.write(data);
                jos.closeEntry();
            }
        }
        System.out.println("Transformed jar written to " + outputJar.getAbsolutePath());
    }

    // Class visitor that delegates method rewriting to our custom method visitor.
    static class AWTReplacementClassVisitor extends ClassVisitor {
        public AWTReplacementClassVisitor(ClassVisitor cv) {
            super(Opcodes.ASM9, cv);
        }

        @Override
        public MethodVisitor visitMethod(int access, String name, String descriptor,
                                         String signature, String[] exceptions) {
            MethodVisitor mv = super.visitMethod(access, name, descriptor, signature, exceptions);
            return new AWTReplacementMethodVisitor(mv);
        }
    }

    // Method visitor that rewrites instructions referencing java.awt.
    static class AWTReplacementMethodVisitor extends MethodVisitor {
        public AWTReplacementMethodVisitor(MethodVisitor mv) {
            super(Opcodes.ASM9, mv);
        }

        @Override
        public void visitMethodInsn(int opcode, String owner, String name,
                                    String descriptor, boolean isInterface) {
            if (owner.startsWith("java/awt/")) {
                // Instead of invoking the method, insert bytecode to throw an exception.
                mv.visitTypeInsn(Opcodes.NEW, "java/lang/UnsupportedOperationException");
                mv.visitInsn(Opcodes.DUP);
                mv.visitLdcInsn("COMMAND IS UNSUPPORTED IN THIS crowdin-cli build. AWT call encountered: "
                                  + owner.replace('/', '.') + "." + name);
                mv.visitMethodInsn(Opcodes.INVOKESPECIAL, "java/lang/UnsupportedOperationException",
                                   "<init>", "(Ljava/lang/String;)V", false);
                mv.visitInsn(Opcodes.ATHROW);
            } else {
                super.visitMethodInsn(opcode, owner, name, descriptor, isInterface);
            }
        }

        @Override
        public void visitFieldInsn(int opcode, String owner, String name, String descriptor) {
            if (owner.startsWith("java/awt/")) {
                // Replace field access with exception throw.
                mv.visitTypeInsn(Opcodes.NEW, "java/lang/UnsupportedOperationException");
                mv.visitInsn(Opcodes.DUP);
                mv.visitLdcInsn("AWT field access encountered: "
                                  + owner.replace('/', '.') + "." + name);
                mv.visitMethodInsn(Opcodes.INVOKESPECIAL, "java/lang/UnsupportedOperationException",
                                   "<init>", "(Ljava/lang/String;)V", false);
                mv.visitInsn(Opcodes.ATHROW);
            } else {
                super.visitFieldInsn(opcode, owner, name, descriptor);
            }
        }
    }
}
