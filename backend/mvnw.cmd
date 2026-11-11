@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_SAVE_ERRORLEVEL__=
@SET __MVNW_SAVE_ERRORLEVEL__=%ERRORLEVEL%

@REM Find the project basedir, i.e., the directory that contains the folder ".mvn".
@REM Fallback to current working directory if not found.

set /P __MVNW_DUMMY__=""< "NUL"
set __MVNW_PROJECT_BASEDIR__=%~dp0

:__MVNW_SEARCH_PROJECT_BASEDIR__
IF EXIST "%__MVNW_PROJECT_BASEDIR__%\.mvn" GOTO __MVNW_FOUND_PROJECT_BASEDIR__
IF [%__MVNW_PROJECT_BASEDIR__%] EQU [%__MVNW_PROJECT_BASEDIR__:~0,3%] GOTO __MVNW_REACHED_DRIVE_ROOT__
SET __MVNW_PROJECT_BASEDIR__=%__MVNW_PROJECT_BASEDIR__%..
GOTO __MVNW_SEARCH_PROJECT_BASEDIR__
:__MVNW_REACHED_DRIVE_ROOT__
SET __MVNW_PROJECT_BASEDIR__=%CD%
:__MVNW_FOUND_PROJECT_BASEDIR__
FOR /F "delims=" %%T IN ('CALL "%JAVA_HOME%\bin\java.exe" -classpath "%__MVNW_PROJECT_BASEDIR__%\.mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*') DO (
    IF "%%T"=="" (
        ECHO Maven Wrapper main not found. Re-run after downloading the wrapper jar.
        SET __MVNW_ERROR__=1
        GOTO __MVNW_END__
    )
)

@REM --- Download wrapper jar if needed ---
IF EXIST "%__MVNW_PROJECT_BASEDIR__%\.mvn\wrapper\maven-wrapper.jar" GOTO __MVNW_JAR_EXISTS__
FOR /F "tokens=* USEBACKQ" %%F IN (`"%JAVA_HOME%\bin\java.exe" -classpath "" org.apache.maven.wrapper.BootstrapMainStarter 2^>^&1`) DO (
    echo %%F
)
:__MVNW_JAR_EXISTS__

"%JAVA_HOME%\bin\java.exe" ^
  -classpath "%__MVNW_PROJECT_BASEDIR__%\.mvn\wrapper\maven-wrapper.jar" ^
  "-Dmaven.multiModuleProjectDirectory=%__MVNW_PROJECT_BASEDIR__%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*

:__MVNW_END__
EXIT /B %ERRORLEVEL%
