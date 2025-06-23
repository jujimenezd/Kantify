#!/usr/bin/env python3
"""
Script para iniciar el servidor FastAPI con verificaciones previas
Uso: python start_server.py
"""

import os
import sys
import subprocess


def check_dependencies():
    try:
        print("✅ Dependencias FastAPI instaladas")
        return True
    except ImportError as e:
        print(f"❌ Dependencia faltante: {e}")
        print("💡 Ejecuta: pip install -r requirements_api.txt")
        return False


def check_environment():
    """Verificar configuración del entorno"""
    checks = []

    # Verificar ChromaDB
    if os.path.exists("chroma"):
        print("✅ Base de datos ChromaDB encontrada")
        checks.append(True)
    else:
        print("❌ Base de datos ChromaDB no encontrada")
        print("💡 Ejecuta: python core/create_database.py")
        checks.append(False)

    # Verificar .env y OpenAI API Key
    if os.path.exists(".env"):
        print("✅ Archivo .env encontrado")
        # Cargar .env
        from dotenv import load_dotenv

        load_dotenv()

        if os.getenv("OPENAI_API_KEY"):
            print("✅ OpenAI API Key configurada")
            checks.append(True)
        else:
            print("❌ OpenAI API Key no encontrada en .env")
            checks.append(False)
    else:
        print("❌ Archivo .env no encontrado")
        print("💡 Crea un archivo .env con: OPENAI_API_KEY=tu_clave_aqui")
        checks.append(False)

    return all(checks)


def start_server():
    """Iniciar el servidor FastAPI"""
    print("\n🚀 Iniciando servidor FastAPI...")
    print("📍 URL: http://localhost:8000")
    print("📖 Docs: http://localhost:8000/docs")
    print("🛑 Para detener: Ctrl+C")
    print("-" * 50)

    try:
        # Usar subprocess para mejor control
        cmd = [
            sys.executable,
            "-m",
            "uvicorn",
            "api.server:app",
            "--host",
            "127.0.0.1",
            "--port",
            "8000",
            "--reload",
            "--log-level",
            "info",
        ]

        subprocess.run(cmd, check=True)

    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error iniciando servidor: {e}")
        sys.exit(1)


def main():
    print("🔧 RAG Dilemma API Server - Verificación e inicio")
    print("=" * 60)

    # Verificar dependencias
    if not check_dependencies():
        print("\n❌ Instala las dependencias primero")
        sys.exit(1)

    # Verificar entorno
    if not check_environment():
        print("\n⚠️  Hay problemas de configuración.")
        response = input("¿Quieres continuar de todos modos? (y/N): ")
        if response.lower() != "y":
            print("Abortando...")
            sys.exit(1)

    print("\n🎉 Todo listo para iniciar el servidor!")

    # Iniciar servidor
    start_server()


if __name__ == "__main__":
    main()
