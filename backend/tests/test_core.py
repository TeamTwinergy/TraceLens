import io, json, unittest, zipfile
from pathlib import Path
from app import extract, retrieval
from app.validation import UploadError, safe_filename, validate_upload

CASE = json.loads((Path(__file__).resolve().parents[2] / "demo_data" / "orion_case.json").read_text(encoding="utf-8"))


class Validation(unittest.TestCase):
    def test_safe_filename(self):
        self.assertEqual(safe_filename("../../etc/pass wd<>.pdf"), "pass wd__.pdf")
    def test_rejects_bad_type_empty_big_and_fake_pdf(self):
        for name, data in [("a.exe", b"x"), ("a.txt", b""), ("a.pdf", b"not a pdf")]:
            with self.assertRaises(UploadError): validate_upload(name, data, 1000)
        with self.assertRaises(UploadError): validate_upload("a.txt", b"x" * 2000, 1000)
    def test_accepts_txt(self):
        self.assertEqual(validate_upload("a.txt", b"hello", 1000), "txt")


class Extraction(unittest.TestCase):
    def test_txt_and_csv(self):
        self.assertEqual(extract.extract("txt", "héllo".encode()).text, "héllo")
        self.assertEqual(extract.extract("csv", b"a,b\n1,2").kind, "csv")
    def test_docx(self):
        try:
            import docx
        except ImportError:
            self.skipTest("python-docx not installed")
        d = docx.Document(); d.add_paragraph("Invoice sent to Orion Systems"); b = io.BytesIO(); d.save(b)
        self.assertIn("Orion Systems", extract.extract("docx", b.getvalue()).text)
    def test_corrupt_docx(self):
        try:
            import docx  # noqa
        except ImportError:
            self.skipTest("python-docx not installed")
        with self.assertRaises(UploadError): extract.extract("docx", b"PK-broken")


class Retrieval(unittest.TestCase):
    def test_connection_question_has_citations_and_contradiction(self):
        a = retrieval.answer(CASE, "What evidence connects Rajiv Mehta to Orion Systems?")
        self.assertEqual(a["status"], "ok")
        self.assertEqual({c["evidence_id"] for c in a["citations"]}, {"E-004", "E-011", "E-013"})
        self.assertIn("C-07", a["note"])
    def test_amount_filter(self):
        a = retrieval.answer(CASE, "Find all payments above ₹5 lakh")
        self.assertTrue(all(i["evidence_id"] in {"E-004", "E-005", "E-009", "E-010"} for i in a["citations"]))
    def test_insufficient(self):
        self.assertEqual(retrieval.answer(CASE, "recipe for banana bread")["status"], "insufficient")


if __name__ == "__main__":
    unittest.main()


class Auth(unittest.TestCase):
    def setUp(self):
        import tempfile
        from app import config
        self.tmp = tempfile.mkdtemp()
        config.AUTH_DB_PATH = str(Path(self.tmp) / "u.db")

    def test_register_login_and_token(self):
        from app import auth
        r = auth.register("Asha", "Asha@Example.com", "correct horse")
        self.assertEqual(auth.read_token(r["token"])["sub"], "asha@example.com")
        self.assertEqual(auth.login("asha@example.com", "correct horse")["user"]["name"], "Asha")

    def test_rejects_bad_login_duplicate_and_weak(self):
        from app import auth
        auth.register("Asha", "a@b.co", "longenough1")
        with self.assertRaises(auth.AuthError): auth.login("a@b.co", "wrongpass")
        with self.assertRaises(auth.AuthError): auth.register("A", "a@b.co", "longenough1")
        with self.assertRaises(auth.AuthError): auth.register("A", "c@d.co", "short")
        with self.assertRaises(auth.AuthError): auth.read_token("garbage.token")
