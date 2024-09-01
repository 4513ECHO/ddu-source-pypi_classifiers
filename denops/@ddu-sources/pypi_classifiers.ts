import type { ActionData } from "jsr:@shougo/ddu-kind-word@^0.4.1";
import {
  BaseSource,
  type OnInitArguments,
} from "jsr:@shougo/ddu-vim@^6.0.0/source";
import type { Item } from "jsr:@shougo/ddu-vim@^6.0.0/types";
import { TextLineStream } from "jsr:@std/streams@^1.0.3/text-line-stream";
import { ChunkedStream } from "jsr:@4513echo/chunked-stream@^0.2.0";

type Params = Record<PropertyKey, never>;

export class Source extends BaseSource<Params, ActionData> {
  kind = "word";
  #stream?: () => ReadableStream<Item<ActionData>[]>;

  async onInit(args: OnInitArguments<Params>): Promise<void> {
    const response = await fetch(
      "https://pypi.org/pypi?%3Aaction=list_classifiers",
    );
    if (!response.ok) {
      await args.denops.call(
        "ddu#util#print_error",
        `Failed to fetch response: ${response.status} ${response.statusText}`,
        "ddu-source-pypi_classifiers",
      );
      return;
    }
    this.#stream = () =>
      response.clone().body!
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new TextLineStream())
        .pipeThrough(
          new TransformStream<string, Item<ActionData>>({
            transform: (chunk, controller) =>
              controller.enqueue({
                word: chunk,
                action: { text: chunk },
              }),
          }),
        )
        .pipeThrough(new ChunkedStream({ chunkSize: 100 }));
  }

  gather(): ReadableStream<Item<ActionData>[]> {
    return this.#stream!();
  }

  params(): Params {
    return {};
  }
}
