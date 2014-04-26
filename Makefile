REMOVE = @del /F
COMPILE = 7z
COMPILE_FLAGS = a

PROJECT_NAME = MoodleR

$(PROJECT_NAME).xpi: chrome.manifest install.rdf chrome/*
	$(REMOVE) $(PROJECT_NAME).xpi
	$(COMPILE) $(COMPILE_FLAGS) $(PROJECT_NAME).xpi chrome.manifest install.rdf chrome/*

install:
	@install.bat
	
clean:
	$(REMOVE) $(PROJECT_NAME).xpi
	
test: clean $(PROJECT_NAME).xpi install

.PHONY: pack install clean