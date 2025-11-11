import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    UseGuards, 
    Request,
    ParseIntPipe 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WarningsService } from './warnings.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';

@Controller('avisos') 
export class WarningsController {
  constructor(private readonly warningsService: WarningsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() createAlertaDto: CreateAlertaDto) {
    const userId = req.user.sub;
    return this.warningsService.create(userId, createAlertaDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req) {
    const userId = req.user.sub;
    return this.warningsService.findAll(userId); 
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
     const userId = req.user.sub;
     return this.warningsService.findOne(userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Request() req, 
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateAlertaDto: UpdateAlertaDto
  ) {
    const userId = req.user.sub;
    return this.warningsService.update(userId, id, updateAlertaDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.sub;
    return this.warningsService.remove(userId, id);
  }
}
