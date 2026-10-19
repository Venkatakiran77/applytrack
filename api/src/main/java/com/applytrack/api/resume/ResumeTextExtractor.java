package com.applytrack.api.resume;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Component
public class ResumeTextExtractor {
    public String extract(MultipartFile file, String ext) throws IOException {
        try (InputStream in = file.getInputStream()) {
            if ("pdf".equals(ext)) {
                try (PDDocument doc = Loader.loadPDF(in.readAllBytes())) {
                    return new PDFTextStripper().getText(doc);
                }
            }
            try (XWPFDocument doc = new XWPFDocument(in);
                 XWPFWordExtractor ex = new XWPFWordExtractor(doc)) {
                return ex.getText();
            }
        }
    }
}