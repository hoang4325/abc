import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { NotesService } from "./notes.service.js";
import { CreateNoteDto } from "./dto/create-note.dto.js";
import { UpdateNoteDto } from "./dto/update-note.dto.js";
import { NoteQueryDto } from "./dto/note-query.dto.js";

@ApiTags("Notes")
@Controller("notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new note" })
  @ApiResponse({ status: 201, description: "Note created successfully" })
  @ApiResponse({ status: 400, description: "Validation error or empty content" })
  async create(@Body() dto: CreateNoteDto) {
    return this.notesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get paginated list of notes" })
  @ApiResponse({ status: 200, description: "Paginated list of notes" })
  async findAll(@Query() query: NoteQueryDto) {
    return this.notesService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get note details by id" })
  @ApiParam({ name: "id", format: "uuid", description: "Note UUID" })
  @ApiResponse({ status: 200, description: "Note details" })
  @ApiResponse({ status: 404, description: "Note not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.notesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update note content, title or color" })
  @ApiParam({ name: "id", format: "uuid", description: "Note UUID" })
  @ApiResponse({ status: 200, description: "Note updated successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 404, description: "Note not found" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto
  ) {
    return this.notesService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete note" })
  @ApiParam({ name: "id", format: "uuid", description: "Note UUID" })
  @ApiResponse({ status: 200, description: "Note deleted successfully" })
  @ApiResponse({ status: 404, description: "Note not found" })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.notesService.delete(id);
  }
}
