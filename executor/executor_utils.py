import docker
import os
import shutil
import uuid
from docker.errors import *

client = docker.from_env()

IMAGE_NAME = 'kaelssss/cs503_1702_coj'
CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
TEMP_BUILD_DIR = '%s/tmp' % CURRENT_DIR

SOURCE_FILE_NAMES = {
    "java" : "Example.java",
    'python' : 'example.py'
}

BINARY_NAMES = {
    "java" : "Example",
    'python' : 'example.py'
}

BUILD_COMMANDS = {
    "java" : "javac",
    "python" : "python"
}

EXECUTE_COMMANDS = {
    "java" : "java",
    "python" : "python"
}

def load_image():
    try:
        client.images.get(IMAGE_NAME)
    except ImageNotFound:
        print 'image not found here, I will go find it on dockerhub'
        client.images.pull(IMAGE_NAME)
    except APIError:
        print 'image not found here, and I cannot get to the hub'
        return
    print 'Image: [%s] loaded' % IMAGE_NAME

def build_and_run(code, lang):
    result = {
        'build': None, 'run': None, 'error': None
        }

    source_file_parent_dir_name = uuid.uuid4()
    source_file_host_dir = '%s/%s' % (TEMP_BUILD_DIR, source_file_parent_dir_name)
    source_file_guest_dir = '/test/%s' % (source_file_parent_dir_name)

    make_dir(source_file_host_dir)

    with open('%s/%s' % (source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
        source_file.write(code)

    try:
        client.containers.run(
            image=IMAGE_NAME,
            command='%s %s' % (BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang]),
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
            )
        print 'source building complete'
        result['build'] = 'building complete'
    except ContainerError as e:
        print 'building failed'
        result['build'] = e.stderr
        shutil.rmtree(source_file_host_dir)
        return result

    try:
        log = client.containers.run(
            image=IMAGE_NAME,
            command='%s %s' % (EXECUTE_COMMANDS[lang], BINARY_NAMES[lang]),
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
            )
        print 'execution complete'
        result['run'] = log
    except ContainerError as e:
        print 'execution failed'
        result['run'] = e.stderr
        shutil.rmtree(source_file_host_dir)
        return result

    shutil.rmtree(source_file_host_dir)
    return result

def make_dir(dir):
    try:
        os.mkdir(dir)
        print 'temp build directory [%s] created.' % dir
    except OSError:
        print 'temp build directory [%s] already exists.' % dir