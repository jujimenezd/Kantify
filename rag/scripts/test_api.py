#!/usr/bin/env python3
"""
Script de pruebas para el servidor FastAPI
Uso: python scripts/test_api.py
"""

import requests
import time
import sys

BASE_URL = "http://localhost:8000"


def test_health_endpoint():
    """Probar el endpoint de salud"""
    print("🏥 Probando endpoint de salud...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Endpoint de salud OK")
            print(f"   Respuesta: {response.json()}")
            return True
        else:
            print(f"❌ Error en health: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(
            "❌ No se pudo conectar al servidor. ¿Está ejecutándose en localhost:8000?"
        )
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False


def test_topics_endpoint():
    """Probar endpoint de tópicos disponibles"""
    print("\n📚 Probando endpoint de tópicos...")
    try:
        response = requests.get(f"{BASE_URL}/topics")
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint de tópicos OK")
            print(f"   Tópicos: {data['topics']}")
            print(f"   Intensidades: {data['intensities']}")
            return True
        else:
            print(f"❌ Error en topics: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_generate_dilemma():
    """Probar la generación de dilemas"""
    print("\n🎯 Probando generación de dilemas...")

    test_cases = [
        {
            "topic": "Temporalidad Moral",
            "intensity": "Suave",
            "user_context": "Usuario de prueba",
        },
        {"topic": "Alteridad Radical", "intensity": "Medio"},
        {"topic": "Imperativo de Universalización", "intensity": "Extremo"},
        {"topic": "Ontología de la Ignorancia", "intensity": "Suave"},
        {"topic": "Economía Moral del Deseo", "intensity": "Medio"},
        {"topic": "Microética Cotidiana", "intensity": "Extremo"},
    ]

    results = []

    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Caso de prueba {i}:")
        print(f"   📋 {test_case['topic']} - {test_case['intensity']}")

        try:
            start_time = time.time()
            response = requests.post(
                f"{BASE_URL}/generate-dilemma",
                json=test_case,
                timeout=30,  # 30 segundos timeout
            )
            end_time = time.time()

            if response.status_code == 200:
                data = response.json()
                print(f"✅ Dilema generado en {(end_time - start_time):.2f}s")
                print(f"   💭 Texto: {data['dilemma_text'][:100]}...")
                print(
                    f"   🧠 Fundamentación: {data['philosophical_foundation'][:80]}..."
                )
                print(f"   📚 Fuentes: {data['used_sources']}")
                results.append(
                    {"test": i, "success": True, "time": end_time - start_time}
                )
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                results.append(
                    {"test": i, "success": False, "error": response.status_code}
                )

        except requests.exceptions.Timeout:
            print("❌ Timeout - El servidor tardó más de 30 segundos")
            results.append({"test": i, "success": False, "error": "timeout"})
        except Exception as e:
            print(f"❌ Error: {e}")
            results.append({"test": i, "success": False, "error": str(e)})

    return results


def test_swagger_docs():
    """Verificar que la documentación Swagger esté disponible"""
    print("\n📖 Verificando documentación Swagger...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ Documentación Swagger disponible en http://localhost:8000/docs")
            return True
        else:
            print(f"❌ Error accediendo a docs: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    print("🧪 RAG DILEMMA API - SUITE DE PRUEBAS")
    print("=" * 60)
    print("💡 Asegúrate de que el servidor esté ejecutándose:")
    print("   python start_api_server.py")
    print("-" * 60)

    # Ejecutar todas las pruebas
    tests = [
        ("Health Check", test_health_endpoint),
        ("Topics Endpoint", test_topics_endpoint),
        ("Swagger Docs", test_swagger_docs),
        ("Generate Dilemma", test_generate_dilemma),
    ]

    results = []

    for test_name, test_func in tests:
        print(f"\n🔄 Ejecutando: {test_name}")
        try:
            result = test_func()
            if isinstance(result, list):  # Para test_generate_dilemma que retorna lista
                success = all(r["success"] for r in result)
                results.append(
                    {"name": test_name, "success": success, "details": result}
                )
            else:
                results.append({"name": test_name, "success": result})
        except Exception as e:
            print(f"❌ Error crítico en {test_name}: {e}")
            results.append({"name": test_name, "success": False, "error": str(e)})

    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)

    successful = sum(1 for r in results if r["success"])
    total = len(results)

    for result in results:
        status = "✅" if result["success"] else "❌"
        print(f"{status} {result['name']}")

    print(f"\n🎯 Resultado final: {successful}/{total} pruebas exitosas")

    if successful == total:
        print("🎉 ¡TODAS LAS PRUEBAS PASARON!")
        print("✨ Tu servidor FastAPI está funcionando correctamente")
        print("🚀 Listo para integrar con Next.js")
    else:
        print("⚠️  Algunas pruebas fallaron. Revisa los errores arriba.")
        sys.exit(1)


if __name__ == "__main__":
    main()
