# CafeCanva Flutter Monorepo Control Makefile

.PHONY: init bootstrap clean get codegen test-all

init:
	dart pub global activate melos

bootstrap:
	melos bootstrap

clean:
	melos run clean

get:
	melos run get

codegen:
	melos run codegen

test-all:
	melos exec -- "flutter test"
